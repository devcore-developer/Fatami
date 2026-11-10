const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  await p.storefrontContent.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton' },
  });
  console.log('OK');
  await p.$disconnect();
})();