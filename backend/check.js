const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const pages = await prisma.page.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5
    });
    for (const page of pages) {
        if (page.textContent && page.textContent.includes('<img')) {
            console.log("Found image in page ID:", page.id);
            console.log(page.textContent);
            break;
        }
    }
    process.exit(0);
}
run();
