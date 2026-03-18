import prisma from '../database/client.js';

async function main() {
  console.log('🏗️ Bắt đầu thiết lập Dữ liệu mẫu (Scenario) cho Kiểm thử Giao diện...');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-company' } });
  if (!tenant) throw new Error('Không thấy Tenant');

  // 1. Tìm tài khoản kiểm thử đã tạo ở bước trước
  const emails = [
    'sales_demo@test.com',
    'pur_demo@test.com',
    'tech_demo@test.com',
    'acc_demo@test.com',
    'leader_demo@test.com'
  ];

  const users: { [key: string]: any } = {};
  for (const email of emails) {
    const user = await prisma.user.findFirst({
      where: { email, tenantId: tenant.id },
      include: { role: true }
    });
    if (!user) throw new Error(`Chưa có tài khoản ${email}. Vui lòng chạy create_ui_test_users trước.`);
    users[user.role.name] = user;
  }

  // 2. Tạo Khách hàng & Sản phẩm
  console.log('👥 Tạo Khách hàng & Sản phẩm...');
  const customer = await prisma.customer.create({
    data: { name: 'Công ty Phú Mỹ Hưng (Khách hàng mẫu)', tenantId: tenant.id }
  });

  const product1 = await prisma.product.create({
    data: { sku: 'CABLE_01', name: 'Cáp điện Cadivi 2x4', basePrice: 50000, tenantId: tenant.id }
  });
  const product2 = await prisma.product.create({
    data: { sku: 'LIGHT_01', name: 'Đèn LED Philips 12W', basePrice: 120000, tenantId: tenant.id }
  });

  // 3. Tạo Dự án Mẫu & Thêm tất cả vào Member
  console.log('📂 Tạo Dự án Mẫu và gán Thành viên...');
  const project = await prisma.project.create({
    data: {
      name: 'Dự án Toà nhà Horizon (Verify Permissions)',
      customerId: customer.id,
      tenantId: tenant.id,
      members: {
        create: [
          { userId: users['SALES'].id, role: 'SALES' },
          { userId: users['TL'].id, role: 'TEAM_LEADER' },
          { userId: users['PURCHASING'].id, role: 'PURCHASING' },
          { userId: users['TECHNICAL'].id, role: 'TECHNICAL' },
          { userId: users['ACCOUNTANT'].id, role: 'ACCOUNTANT' }
        ]
      }
    }
  });

  // 4. Tạo Báo giá A: DRAFT (Chỉ Sale và TL thấy)
  console.log('📄 Tạo Báo giá A (DRAFT)...');
  await prisma.quoteRequest.create({
    data: {
      tenantId: tenant.id,
      salesId: users['SALES'].id,
      customerId: customer.id,
      projectId: project.id,
      status: 'DRAFT',
      totalAmount: 170000,
      subTotal: 170000,
      taxAmount: 0,
      items: {
        create: [
          { productId: product1.id, quantity: 1, targetPrice: 50000 },
          { productId: product2.id, quantity: 1, targetPrice: 120000 }
        ]
      }
    }
  });

  // 5. Tạo Báo giá B: SUBMITTED (Purchasing và Tech xem được; Tech bị Masked)
  console.log('📄 Tạo Báo giá B (SUBMITTED_TO_PURCHASING)...');
  await prisma.quoteRequest.create({
    data: {
      tenantId: tenant.id,
      salesId: users['SALES'].id,
      customerId: customer.id,
      projectId: project.id,
      status: 'SUBMITTED_TO_PURCHASING', // Đã gửi Purchasing
      totalAmount: 220000,
      subTotal: 200000,
      taxAmount: 20000,
      items: {
        create: [
          { productId: product1.id, quantity: 2, targetPrice: 50000, finalPrice: 48000 },
          { productId: product2.id, quantity: 1, targetPrice: 120000, finalPrice: 115000 }
        ]
      }
    }
  });

  console.log('\n🎉 Đã thiết lập xong Dữ liệu mẫu hoàn chỉnh!');
  console.log(`- Dự án: "Dự án Toà nhà Horizon (Verify Permissions)"`);
  console.log(`- Báo giá 1: Trạng thái DRAFT (Chỉ Sale xem được)`);
  console.log(`- Báo giá 2: Trạng thái SUBMITTED_TO_PURCHASING (Purchasing, Tech thấy; Tech bị GIẤU GIÁ)`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
