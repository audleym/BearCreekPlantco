// Central place for business info shown across the site.
// Edit these values any time — nothing else in the codebase needs to change.

export const siteConfig = {
  name: "Bear Creek Plant Company",
  tagline: "Greenhouse-grown annuals, hanging baskets & more in Central Illinois",
  description:
    "Family greenhouse in Central Illinois growing high-quality annuals, hanging baskets, combo planters, perennials and herbs for pickup every spring.",

  address: {
    line1: "153 Bear Creek Ln",
    city: "Donnellson",
    state: "IL",
    zip: "62019",
  },

  // No business phone line yet — leave blank and the site hides phone mentions.
  // Add one later (e.g. phone: "(555) 555-1234", phoneHref: "tel:+15555551234") to show it again.
  phone: "",
  phoneHref: "",
  email: "elijaheyman5@gmail.com",

  facebookUrl: "https://www.facebook.com/profile.php?id=61589919712703",

  // TODO: confirm/adjust seasonal hours
  hours: [
    { day: "Monday", hours: "9am – 6pm" },
    { day: "Tuesday", hours: "9am – 6pm" },
    { day: "Wednesday", hours: "9am – 6pm" },
    { day: "Thursday", hours: "9am – 6pm" },
    { day: "Friday", hours: "9am – 6pm" },
    { day: "Saturday", hours: "9am – 5pm" },
    { day: "Sunday", hours: "11am – 4pm" },
  ],

  seasonNote:
    "Open seasonally for spring plant sales. Hours above are typical in-season hours — email ahead in the off-season.",
} as const;

export const fullAddress = `${siteConfig.address.line1}, ${siteConfig.address.city}, ${siteConfig.address.state} ${siteConfig.address.zip}`;
