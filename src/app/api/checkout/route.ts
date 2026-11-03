import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("A valid email is required"),
    phone: z.string().min(7, "A valid phone number is required"),
  }),
  pickupDateId: z.string().min(1, "Please choose a pickup date"),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive(),
      })
    )
    .min(1, "Your cart is empty"),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = checkoutSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { customer, pickupDateId, notes, items } = parsed.data;

  const pickupDate = await prisma.pickupDate.findUnique({ where: { id: pickupDateId } });
  if (!pickupDate || !pickupDate.isOpen) {
    return NextResponse.json({ error: "That pickup date is no longer available." }, { status: 400 });
  }

  // Look up authoritative prices/stock server-side — never trust client-supplied prices.
  const productIds = items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));
  const lineItems: { productId: string; name: string; quantity: number; priceCents: number }[] = [];

  for (const item of items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json({ error: "One of the items in your cart is no longer available." }, { status: 400 });
    }
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Sorry, only ${product.stock} of "${product.name}" left in stock.` },
        { status: 400 }
      );
    }
    lineItems.push({
      productId: product.id,
      name: product.name,
      quantity: item.quantity,
      priceCents: product.priceCents,
    });
  }

  const totalCents = lineItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      customerName: customer.name,
      email: customer.email,
      phone: customer.phone,
      pickupDate: pickupDate.date,
      notes: notes || null,
      totalCents,
      status: "pending_payment",
      items: {
        create: lineItems.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          priceCents: i.priceCents,
        })),
      },
    },
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: customer.email,
      line_items: lineItems.map((i) => ({
        quantity: i.quantity,
        price_data: {
          currency: "usd",
          unit_amount: i.priceCents,
          product_data: { name: i.name },
        },
      })),
      metadata: { orderId: order.id },
      success_url: `${siteUrl}/order/success?order_id=${order.id}`,
      cancel_url: `${siteUrl}/checkout`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: session.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error", err);
    return NextResponse.json(
      { error: "We couldn't start checkout. Please try again or contact us to place your order." },
      { status: 502 }
    );
  }
}
