import { seedCatalog } from "../src/lib/catalog-seed";
import { db } from "../src/lib/db";
async function main() {
  if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before seeding");
  const client = await db().connect();
  try {
    const { inserted, skipped } = await seedCatalog(client);
    console.log(`Catalog seeded: ${inserted.length} inserted, ${skipped} already present (left unchanged).`);
  } finally { client.release(); await db().end(); }
}
main().catch(() => { console.error("Seeding failed. Run db:migrate first and check database connectivity."); process.exit(1); });
