const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Cleaning up database...");
  await prisma.campaignLog.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.segment.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.customer.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Seeding admin user...");
  const adminUser = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@crm.com",
      password: hashPassword("adminpassword123"),
    },
  });

  console.log("Seeding customers...");
  const now = new Date();
  
  const customerData = [
    { name: "Alice Johnson", email: "alice@example.com", phone: "+919876543210", city: "Delhi" },
    { name: "Bob Smith", email: "bob@example.com", phone: "+919876543211", city: "Mumbai" },
    { name: "Charlie Brown", email: "charlie@example.com", phone: "+919876543212", city: "Delhi" },
    { name: "Diana Prince", email: "diana@example.com", phone: "+919876543213", city: "Bangalore" },
    { name: "Ethan Hunt", email: "ethan@example.com", phone: "+919876543214", city: "Chennai" },
    { name: "Fiona Gallagher", email: "fiona@example.com", phone: "+919876543215", city: "Delhi" },
    { name: "George Cooper", email: "george@example.com", phone: "+919876543216", city: "Pune" },
    { name: "Hannah Baker", email: "hannah@example.com", phone: "+919876543217", city: "Kolkata" },
    { name: "Ian Malcolm", email: "ian@example.com", phone: "+919876543218", city: "Delhi" },
    { name: "Julia Roberts", email: "julia@example.com", phone: "+919876543219", city: "Mumbai" },
    { name: "Kevin Bacon", email: "kevin@example.com", phone: "+919876543220", city: "Bangalore" },
    { name: "Laura Croft", email: "laura@example.com", phone: "+919876543221", city: "Delhi" },
  ];

  const customers = [];
  for (const c of customerData) {
    const customer = await prisma.customer.create({
      data: c,
    });
    customers.push(customer);
  }

  console.log("Seeding orders...");
  // Helper to subtract days from now
  const daysAgo = (num) => new Date(now.getTime() - num * 24 * 60 * 60 * 1000);

  const orderData = [
    // Alice Johnson (High Spend, Recent Order)
    { customerId: customers[0].id, totalAmount: 5000.0, createdAt: daysAgo(10) },
    { customerId: customers[0].id, totalAmount: 7000.0, createdAt: daysAgo(20) },

    // Bob Smith (High Spend, Recent Order)
    { customerId: customers[1].id, totalAmount: 4000.0, createdAt: daysAgo(5) },
    { customerId: customers[1].id, totalAmount: 2500.0, createdAt: daysAgo(30) },

    // Charlie Brown (Low Spend, Inactive > 60 days)
    { customerId: customers[2].id, totalAmount: 800.0, createdAt: daysAgo(75) },

    // Diana Prince (High Spend, Inactive > 60 days)
    { customerId: customers[3].id, totalAmount: 9000.0, createdAt: daysAgo(90) },

    // Ethan Hunt (Mid Spend, Recent Order)
    { customerId: customers[4].id, totalAmount: 2000.0, createdAt: daysAgo(45) },
    { customerId: customers[4].id, totalAmount: 1200.0, createdAt: daysAgo(60) },

    // Fiona Gallagher (Mid Spend, Inactive > 60 days)
    { customerId: customers[5].id, totalAmount: 4500.0, createdAt: daysAgo(80) },

    // George Cooper (Low Spend, Inactive > 60 days)
    { customerId: customers[6].id, totalAmount: 450.0, createdAt: daysAgo(120) },

    // Hannah Baker (Mid Spend, Recent Order)
    { customerId: customers[7].id, totalAmount: 1500.0, createdAt: daysAgo(15) },

    // Ian Malcolm (High Spend, Inactive > 60 days)
    { customerId: customers[8].id, totalAmount: 5500.0, createdAt: daysAgo(65) },

    // Julia Roberts (Mid Spend, Recent Order)
    { customerId: customers[9].id, totalAmount: 2800.0, createdAt: daysAgo(3) },

    // Kevin Bacon (Low Spend, Inactive > 60 days)
    { customerId: customers[10].id, totalAmount: 350.0, createdAt: daysAgo(150) },

    // Laura Croft (High Spend, Recent Order)
    { customerId: customers[11].id, totalAmount: 4200.0, createdAt: daysAgo(40) },
    { customerId: customers[11].id, totalAmount: 3000.0, createdAt: daysAgo(70) },
  ];

  for (const o of orderData) {
    await prisma.order.create({
      data: o,
    });
  }

  // Recalculate customer spend & last order date
  console.log("Updating customer totals...");
  for (const customer of customers) {
    const orders = await prisma.order.findMany({
      where: { customerId: customer.id },
      orderBy: { createdAt: "desc" },
    });

    const totalSpend = orders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lastOrderDate = orders.length > 0 ? orders[0].createdAt : null;

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalSpend,
        lastOrderDate,
      },
    });
  }

  console.log("Seeding segments...");
  // Segment 1: Spend > 5000
  const highSpendersSegment = await prisma.segment.create({
    data: {
      name: "High Spenders (Spend > 5000)",
      description: "Customers who have spent more than 5,000 INR in total.",
      criteria: {
        conditions: [
          { field: "totalSpend", operator: "gt", value: 5000 }
        ]
      },
    },
  });

  // Segment 2: Last Order > 60 days
  const churnRiskSegment = await prisma.segment.create({
    data: {
      name: "Churn Risk (Inactive > 60 Days)",
      description: "Customers who haven't placed an order in the last 60 days.",
      criteria: {
        conditions: [
          { field: "lastOrderDays", operator: "gt", value: 60 }
        ]
      },
    },
  });

  // Segment 3: City = Delhi
  const delhiSegment = await prisma.segment.create({
    data: {
      name: "Delhi Shoppers",
      description: "Customers located in Delhi.",
      criteria: {
        conditions: [
          { field: "city", operator: "equals", value: "Delhi" }
        ]
      },
    },
  });

  console.log("Seeding campaigns and execution logs...");
  // Campaign 1: VIP Offer for High Spenders
  const vipCampaign = await prisma.campaign.create({
    data: {
      name: "VIP Appreciation WhatsApp Offer",
      segmentId: highSpendersSegment.id,
      channel: "WHATSAPP",
      messageTemplate: "Hello {name}, as one of our premier customers with total spend of ₹{totalSpend}, here is an exclusive 20% off on your next purchase! Code: PREMIER20.",
      status: "COMPLETED",
    },
  });

  // Fetch updated customers matching high spenders to log campaign delivery
  const highSpenderCustomers = await prisma.customer.findMany({
    where: { totalSpend: { gt: 5000 } },
  });

  const campaign1Statuses = ["CLICKED", "READ", "OPENED", "DELIVERED", "SENT"];
  for (let i = 0; i < highSpenderCustomers.length; i++) {
    await prisma.campaignLog.create({
      data: {
        campaignId: vipCampaign.id,
        customerId: highSpenderCustomers[i].id,
        status: campaign1Statuses[i % campaign1Statuses.length],
        createdAt: daysAgo(2),
      },
    });
  }

  // Campaign 2: Re-engagement Email
  const reengageCampaign = await prisma.campaign.create({
    data: {
      name: "We Miss You Email Campaign",
      segmentId: churnRiskSegment.id,
      channel: "EMAIL",
      messageTemplate: "Hey {name}, we haven't seen you in a while! Here is a special gift. Free shipping on all orders this week with code: WEWIN.",
      status: "COMPLETED",
    },
  });

  // Fetch inactive customers (lastOrderDate < now - 60 days)
  const limitDate = daysAgo(60);
  const inactiveCustomers = await prisma.customer.findMany({
    where: {
      OR: [
        { lastOrderDate: { lt: limitDate } },
        { lastOrderDate: null },
      ],
    },
  });

  const campaign2Statuses = ["READ", "OPENED", "DELIVERED", "FAILED", "SENT"];
  for (let i = 0; i < inactiveCustomers.length; i++) {
    await prisma.campaignLog.create({
      data: {
        campaignId: reengageCampaign.id,
        customerId: inactiveCustomers[i].id,
        status: campaign2Statuses[i % campaign2Statuses.length],
        createdAt: daysAgo(1),
      },
    });
  }

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
