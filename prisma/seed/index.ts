/**
 * CardIntel — Database Seed Script
 *
 * Seeds the database with:
 * 1. Complete issuer registry (50+ entities)
 * 2. Network registry (5 networks)
 * 3. Category taxonomy (28 types)
 * 4. Synonym dictionary
 * 5. Source authority rules
 * 6. Tax configuration
 *
 * Run: npx tsx prisma/seed/index.ts
 */

import { PrismaClient } from "@prisma/client";
import { allIssuers } from "./issuers";
import { networks, categories, synonyms, sourceAuthorityRules, taxConfigs } from "./taxonomy";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting CardIntel database seed...\n");

  // 1. Networks
  console.log("📡 Seeding networks...");
  for (const network of networks) {
    await prisma.network.upsert({
      where: { slug: network.slug },
      update: { name: network.name, type: network.type, description: network.description },
      create: network,
    });
  }
  console.log(`  ✓ ${networks.length} networks seeded`);

  // 2. Categories
  console.log("📂 Seeding categories...");
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, type: cat.type as any, displayOrder: cat.displayOrder, description: cat.description, iconName: cat.iconName },
      create: { name: cat.name, slug: cat.slug, type: cat.type as any, displayOrder: cat.displayOrder, description: cat.description, iconName: cat.iconName },
    });
  }
  console.log(`  ✓ ${categories.length} categories seeded`);

  // 3. Issuers
  console.log("🏦 Seeding issuers...");
  for (const issuer of allIssuers) {
    const created = await prisma.issuer.upsert({
      where: { slug: issuer.slug },
      update: {
        name: issuer.name,
        shortName: issuer.shortName,
        issuerType: issuer.issuerType as any,
        canIssueCreditCards: issuer.canIssueCreditCards,
        canIssueBusinessCards: issuer.canIssueBusinessCards,
        canIssueCoBrandedCards: issuer.canIssueCoBrandedCards,
        canIssueSecuredCards: issuer.canIssueSecuredCards,
        rbiRegulatedEntity: issuer.rbiRegulatedEntity,
        websiteUrl: issuer.websiteUrl,
        headquartersCity: issuer.headquartersCity,
        description: issuer.description,
      },
      create: {
        name: issuer.name,
        shortName: issuer.shortName,
        slug: issuer.slug,
        issuerType: issuer.issuerType as any,
        canIssueCreditCards: issuer.canIssueCreditCards,
        canIssueBusinessCards: issuer.canIssueBusinessCards,
        canIssueCoBrandedCards: issuer.canIssueCoBrandedCards,
        canIssueSecuredCards: issuer.canIssueSecuredCards,
        rbiRegulatedEntity: issuer.rbiRegulatedEntity,
        websiteUrl: issuer.websiteUrl,
        headquartersCity: issuer.headquartersCity,
        description: issuer.description,
      },
    });

    // Create research checklist
    await prisma.issuerResearchChecklist.upsert({
      where: { issuerId: created.id },
      update: {},
      create: { issuerId: created.id },
    });
  }
  console.log(`  ✓ ${allIssuers.length} issuers seeded`);

  // 4. Synonyms
  console.log("🔤 Seeding synonyms...");
  for (const syn of synonyms) {
    await prisma.synonym.upsert({
      where: { id: syn.term }, // Will fail on first run, handled by create
      update: { synonyms: syn.synonyms, category: syn.category },
      create: { term: syn.term, synonyms: syn.synonyms, category: syn.category },
    });
  }
  console.log(`  ✓ ${synonyms.length} synonym groups seeded`);

  // 5. Source Authority Rules
  console.log("📊 Seeding source authority rules...");
  for (const rule of sourceAuthorityRules) {
    await prisma.sourceAuthorityRule.upsert({
      where: { sourceType: rule.sourceType },
      update: { authorityScore: rule.authorityScore, freshnessDecayDays: rule.freshnessDecayDays, description: rule.description },
      create: rule,
    });
  }
  console.log(`  ✓ ${sourceAuthorityRules.length} authority rules seeded`);

  // 6. Tax Config
  console.log("💰 Seeding tax configuration...");
  for (const tax of taxConfigs) {
    await prisma.taxConfig.upsert({
      where: { taxType: tax.taxType },
      update: { rate: tax.rate, description: tax.description },
      create: { taxType: tax.taxType, rate: tax.rate, effectiveFrom: new Date(tax.effectiveFrom), description: tax.description },
    });
  }
  console.log(`  ✓ ${taxConfigs.length} tax configs seeded`);

  // Summary
  console.log("\n✅ Seed complete!");
  console.log(`   Networks:    ${networks.length}`);
  console.log(`   Categories:  ${categories.length}`);
  console.log(`   Issuers:     ${allIssuers.length}`);
  console.log(`   Synonyms:    ${synonyms.length}`);
  console.log(`   Auth Rules:  ${sourceAuthorityRules.length}`);
  console.log(`   Tax Configs: ${taxConfigs.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
