/**
 * One-off migration: rewrite stored user phone numbers to E.164.
 *
 *   npx tsx scripts/normalize-phones.ts          # dry run, prints planned changes
 *   npx tsx scripts/normalize-phones.ts --apply  # writes the changes
 */
import "../src/config/env";
import prisma from "../src/config/db";
import { toE164 } from "../src/utils/phone.utils";

const apply = process.argv.includes("--apply");

const main = async () => {
  const users = await prisma.user.findMany({
    where: { phone: { not: null } },
    select: { id: true, email: true, phone: true },
  });

  let changed = 0;
  for (const user of users) {
    const normalized = toE164(user.phone!);
    if (!normalized) {
      console.warn(`⚠️  ${user.email}: cannot parse "${user.phone}", left unchanged`);
      continue;
    }
    if (normalized === user.phone) continue;

    console.log(`${user.email}: "${user.phone}" -> "${normalized}"`);
    changed++;
    if (apply) {
      await prisma.user.update({ where: { id: user.id }, data: { phone: normalized } });
    }
  }

  console.log(`\n${changed} of ${users.length} numbers ${apply ? "updated" : "would change (dry run)"}.`);
};

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
