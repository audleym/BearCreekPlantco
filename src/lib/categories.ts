// Shop categories, based on what Bear Creek Plant Company is actually growing
// this season (derived from the real order placed with the supplier).
export type Category = {
  slug: string;
  name: string;
  blurb: string;
};

export const categories: Category[] = [
  {
    slug: "annual-flowers",
    name: "Annual Flowers",
    blurb: "Petunias, calibrachoa, verbena, lantana and more season-long color.",
  },
  {
    slug: "dahlias",
    name: "Dahlias",
    blurb: "Bold, everblooming dahlias bred for containers, beds, and borders.",
  },
  {
    slug: "geraniums",
    name: "Geraniums",
    blurb: "Zonal, interspecific, and specialty geraniums grown from strong, well-branched starts.",
  },
  {
    slug: "hanging-baskets",
    name: "Hanging Baskets",
    blurb: "Ready-to-hang combo baskets, fully grown and blooming, in a mix of varieties.",
  },
  {
    slug: "coleus-foliage",
    name: "Coleus & Foliage",
    blurb: "Colorful foliage plants for beds, containers, and shade gardens.",
  },
  {
    slug: "succulents-tropicals",
    name: "Succulents & Tropicals",
    blurb: "Dipladenia and other heat-loving tropicals for pots and patios.",
  },
  {
    slug: "vines-trailing",
    name: "Vines & Trailing",
    blurb: "Potato vine and other trailing plants for baskets and spillers.",
  },
  {
    slug: "ornamental-grasses",
    name: "Ornamental Grasses",
    blurb: "Texture and movement for containers and landscape beds.",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
