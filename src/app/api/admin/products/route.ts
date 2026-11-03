import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { categories } from "@/lib/categories";

const categorySlugs = categories.map((c) => c.slug) as [string, ...string[]];

const schema = z.object({
  name: z.string().min(1),
  category: z.enum(categorySlugs),
  description: z.string().min(1),
  priceCents: z.number().int().positive(),
  size: z.string().min(1),
  stock: z.number().int().min(0),
});

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid product" }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let suffix = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${++suffix}`;
  }

  const product = await prisma.product.create({
    data: { ...parsed.data, slug },
  });

  return NextResponse.json({ product });
}
