import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'singhrobinch@gmail.com';
    
    console.log(`Searching for user with email: ${email}`);
    
    const user = await prisma.appUser.findUnique({
        where: { email }
    });

    if (!user) {
        console.error(`User with email ${email} not found.`);
        return;
    }

    console.log(`Found user: ${user.id}. Removing transactions...`);

    // Delete transactions
    const deleteCount = await prisma.transaction.deleteMany({
        where: { userId: user.id }
    });

    console.log(`Successfully removed transactions for user. Total deleted: ${deleteCount.count}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
