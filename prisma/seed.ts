import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding NEWGEN STORE database…");

  // Seed admin user
  const admin = await prisma.user.upsert({
    where: { email: "inezapaccy45@gmail.com" },
    update: {},
    create: {
      email: "inezapaccy45@gmail.com",
      name: "NewGen Admin",
      role: "SUPER_ADMIN",
      isActive: true,
    },
  });
  console.log("✅ Admin user:", admin.email);

  // Seed categories
  const categories = await Promise.all([
    prisma.category.upsert({ where: { slug: "smartphones" }, update: {}, create: { name: "Smartphones", slug: "smartphones", emoji: "📱", color: "#2563EB", isActive: true, sortOrder: 1 } }),
    prisma.category.upsert({ where: { slug: "laptops" }, update: {}, create: { name: "Laptops", slug: "laptops", emoji: "💻", color: "#7C3AED", isActive: true, sortOrder: 2 } }),
    prisma.category.upsert({ where: { slug: "tablets" }, update: {}, create: { name: "Tablets", slug: "tablets", emoji: "📟", color: "#059669", isActive: true, sortOrder: 3 } }),
    prisma.category.upsert({ where: { slug: "accessories" }, update: {}, create: { name: "Accessories", slug: "accessories", emoji: "🎧", color: "#D97706", isActive: true, sortOrder: 4 } }),
    prisma.category.upsert({ where: { slug: "smart-tv" }, update: {}, create: { name: "Smart TVs", slug: "smart-tv", emoji: "📺", color: "#DC2626", isActive: true, sortOrder: 5 } }),
    prisma.category.upsert({ where: { slug: "power" }, update: {}, create: { name: "Power Banks", slug: "power", emoji: "🔋", color: "#0891B2", isActive: true, sortOrder: 6 } }),
  ]);
  console.log("✅ Categories seeded:", categories.length);

  // Seed sample products
  const sampleProducts = [
    {
      name: "Samsung Galaxy A55 5G",
      slug: "samsung-galaxy-a55-5g",
      sku: "SAM-A55-5G",
      description: "Samsung Galaxy A55 5G — 6.6-inch Super AMOLED, 50MP camera, 5000mAh battery. Perfect for retail resellers.",
      categoryId: categories[0].id,
      stock: 120,
      minOrderQty: 5,
      basePrice: 420000,
      featured: true,
      status: "ACTIVE" as const,
    },
    {
      name: "iPhone 15 Pro Max",
      slug: "iphone-15-pro-max",
      sku: "IPH-15PM-256",
      description: "Apple iPhone 15 Pro Max 256GB. Titanium design, A17 Pro chip, 48MP camera system.",
      categoryId: categories[0].id,
      stock: 45,
      minOrderQty: 2,
      basePrice: 1850000,
      featured: true,
      status: "ACTIVE" as const,
    },
    {
      name: "Xiaomi Redmi Note 13",
      slug: "xiaomi-redmi-note-13",
      sku: "XMI-RN13-128",
      description: "Xiaomi Redmi Note 13 128GB. 6.67-inch AMOLED, 108MP camera, 5000mAh. Top seller for DRC market.",
      categoryId: categories[0].id,
      stock: 200,
      minOrderQty: 10,
      basePrice: 285000,
      featured: false,
      status: "ACTIVE" as const,
    },
    {
      name: "HP EliteBook 840 G10",
      slug: "hp-elitebook-840-g10",
      sku: "HP-EB840-G10",
      description: "HP EliteBook 840 G10 — Intel Core i7 13th Gen, 16GB RAM, 512GB SSD. Business laptop for enterprise.",
      categoryId: categories[1].id,
      stock: 30,
      minOrderQty: 2,
      basePrice: 1200000,
      featured: true,
      status: "ACTIVE" as const,
    },
    {
      name: "JBL Tune 720BT Headphones",
      slug: "jbl-tune-720bt",
      sku: "JBL-T720BT",
      description: "JBL Tune 720BT Wireless Headphones. 76hr battery, Pure Bass, foldable design.",
      categoryId: categories[3].id,
      stock: 150,
      minOrderQty: 5,
      basePrice: 95000,
      featured: true,
      status: "ACTIVE" as const,
    },
    {
      name: "Tecno Spark 20 Pro",
      slug: "tecno-spark-20-pro",
      sku: "TCN-SP20P",
      description: "Tecno Spark 20 Pro — 6.78-inch FHD+, 108MP AI Camera, 5000mAh. Popular in East Africa.",
      categoryId: categories[0].id,
      stock: 180,
      minOrderQty: 10,
      basePrice: 145000,
      featured: false,
      status: "ACTIVE" as const,
    },
  ];

  for (const product of sampleProducts) {
    const existing = await prisma.product.findUnique({ where: { slug: product.slug } });
    if (!existing) {
      const created = await prisma.product.create({
        data: {
          ...product,
          pricingTiers: {
            create: [
              { label: "Standard", minQty: product.minOrderQty, maxQty: product.minOrderQty * 4 - 1, price: product.basePrice },
              { label: "Bulk (×5)", minQty: product.minOrderQty * 5, maxQty: product.minOrderQty * 19, price: Math.round(product.basePrice * 0.92) },
              { label: "Wholesale (×20+)", minQty: product.minOrderQty * 20, maxQty: null, price: Math.round(product.basePrice * 0.85) },
            ],
          },
        },
      });
      console.log("✅ Product:", created.name);
    }
  }

  // Seed default settings
  const defaultSettings = [
    { key: "site_name", value: "NEWGEN STORE", label: "Site Name", type: "text", group: "general" },
    { key: "site_tagline", value: "Wholesale Electronics Rwanda & DRC", label: "Site Tagline", type: "text", group: "general" },
    { key: "contact_phone", value: "+250 788 000 000", label: "Contact Phone", type: "text", group: "contact" },
    { key: "contact_email", value: "info@newgen.com", label: "Contact Email", type: "email", group: "contact" },
    { key: "delivery_kigali", value: "2000", label: "Delivery Fee Kigali", type: "number", group: "delivery" },
    { key: "delivery_rwanda", value: "5000", label: "Delivery Fee Rwanda", type: "number", group: "delivery" },
    { key: "delivery_drc", value: "10000", label: "Delivery Fee DRC", type: "number", group: "delivery" },
    { key: "free_delivery_threshold", value: "500000", label: "Free Delivery Threshold", type: "number", group: "delivery" },
  ];

  for (const setting of defaultSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log("✅ Site settings seeded");

  console.log("\n🎉 Seed complete! Login at /admin/login with:", admin.email);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => await prisma.$disconnect());
