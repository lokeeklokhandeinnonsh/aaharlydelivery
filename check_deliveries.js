// Quick check script - run from aaharly-api directory
// Usage: cd C:\Users\pc\aaharly-api && node ../aaharly-delivery/aaharlydelivery/check_deliveries.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    // 1. List all vendors
    const vendors = await prisma.vendor.findMany({
        select: { id: true, name: true, status: true }
    });
    console.log('\n=== VENDORS ===');
    console.log(JSON.stringify(vendors, null, 2));

    // 2. List all vendor users
    const vendorUsers = await prisma.vendorUser.findMany({
        select: { id: true, name: true, email: true, vendor_id: true }
    });
    console.log('\n=== VENDOR USERS ===');
    console.log(JSON.stringify(vendorUsers, null, 2));

    // 3. Check today's meal schedules
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const end = new Date();
    end.setUTCHours(23, 59, 59, 999);

    console.log('\n=== DATE RANGE ===');
    console.log('Today (UTC):', today.toISOString());
    console.log('End (UTC):', end.toISOString());

    const todaySchedules = await prisma.userMealSchedule.findMany({
        where: {
            meal_date: {
                gte: today,
                lte: end
            }
        },
        select: {
            id: true,
            vendor_id: true,
            meal_date: true,
            delivery_status: true,
            subscription: { select: { vendor_id: true } }
        }
    });

    console.log('\n=== TODAY SCHEDULES (' + todaySchedules.length + ') ===');
    console.log(JSON.stringify(todaySchedules, null, 2));

    // 4. Check ALL meal schedules (recent)
    const allSchedules = await prisma.userMealSchedule.findMany({
        orderBy: { meal_date: 'desc' },
        take: 10,
        select: {
            id: true,
            vendor_id: true,
            meal_date: true,
            delivery_status: true,
            subscription: { select: { vendor_id: true } }
        }
    });

    console.log('\n=== RECENT 10 SCHEDULES ===');
    console.log(JSON.stringify(allSchedules, null, 2));

    // 5. Count total schedules
    const totalCount = await prisma.userMealSchedule.count();
    console.log('\n=== TOTAL SCHEDULES:', totalCount, '===');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
