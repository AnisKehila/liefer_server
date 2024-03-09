import { DeliveryType, PackageStatus, PrismaClient } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  for (let i = 0; i < 100; i++) {
    await prisma.package.create({
      data: {
        user: { connect: { id: faker.number.int({ min: 1, max: 1 }) } },
        status: faker.helpers.enumValue(PackageStatus),
        discription: faker.commerce.productName(),
        type: faker.helpers.enumValue(DeliveryType),
        origin: faker.location.city(),
        destination: faker.location.city(),
        price: +faker.commerce.price({ min: 0, max: 25000, dec: 0 }),
        service_price: +faker.commerce.price({ min: 400, max: 1200, dec: 0 }),
        created_at: faker.date.recent(),
        edited_at: faker.date.recent(),
      },
    });
  }
  console.log("Data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
