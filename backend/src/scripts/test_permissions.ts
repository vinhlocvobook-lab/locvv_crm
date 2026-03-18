import prisma from '../database/client.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const PORT = process.env.PORT || 4000;
const BASE_URL = `http://localhost:${PORT}`;

async function main() {
  console.log('🧪 Bắt đầu kịch bản kiểm thử phân quyền...');

  // 1. Lấy Tenant ID (Demo)
  const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-company' } });
  if (!tenant) throw new Error('Không tìm thấy Tenant mẫu');

  // 2. Định nghĩa các role cần kiểm thử
  const rolesToCheck = ['SALES', 'PURCHASING', 'TECHNICAL', 'ACCOUNTANT', 'TL'];
  const users: { [key: string]: any } = {};

  console.log('👥 1. Khởi tạo tài khoản kiểm thử...');
  for (const roleName of rolesToCheck) {
    const role = await prisma.role.findUnique({ where: { name: roleName } });
    if (!role) throw new Error(`Không thấy role ${roleName}`);

    const email = `${roleName.toLowerCase()}@test.com`;
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Xóa nếu có sẵn để sạch dữ liệu test (Tránh lỗi FK Constraint)
    const existing = await prisma.user.findFirst({ where: { email } });
    if (existing) {
      await prisma.quoteRequestItem.deleteMany({ where: { quoteRequest: { salesId: existing.id } } });
      await prisma.quoteRequest.deleteMany({ where: { salesId: existing.id } });
      await prisma.supplierQuote.deleteMany({ where: { purchasingId: existing.id } });
      await prisma.projectMember.deleteMany({ where: { userId: existing.id } });
      await prisma.user.delete({ where: { id: existing.id } });
    }

    users[roleName] = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `Test ${roleName}`,
        tenantId: tenant.id,
        roleId: role.id,
        status: 'active'
      }
    });

    // Tạo token cho User
    users[roleName].token = jwt.sign(
      { uid: users[roleName].id, tid: tenant.id, role: roleName },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

  // 3. Tạo dữ liệu giả lập (Customer, Product, Project, QuoteRequest)
  console.log('📊 2. Khởi tạo dữ liệu mẫu (Project + Quote)...');
  
  const customer = await prisma.customer.create({
    data: { name: 'Khách hàng Test', tenantId: tenant.id }
  });

  const product = await prisma.product.create({
    data: {
      sku: 'TEST_ITEM',
      name: 'Sản phẩm Test Permissions',
      basePrice: 100000,
      tenantId: tenant.id
    }
  });

  const project = await prisma.project.create({
    data: {
      name: 'Dự án Bảo mật TEST',
      customerId: customer.id,
      tenantId: tenant.id,
      members: {
        create: [
          { userId: users['TECHNICAL'].id, role: 'TECHNICAL' } // Tech là thành viên
        ]
      }
    }
  });

  const quote = await prisma.quoteRequest.create({
    data: {
      tenantId: tenant.id,
      salesId: users['SALES'].id,
      customerId: customer.id,
      projectId: project.id,
      status: 'DRAFT',
      totalAmount: 120000,
      subTotal: 100000,
      taxAmount: 20000,
      items: {
        create: {
          productId: product.id,
          quantity: 1,
          targetPrice: 110000,
          finalPrice: 105000
        }
      }
    }
  });

  // 4. BẮT ĐẦU KIỂM THỬ GỌI API
  console.log('\n📡 3. Gọi API Kiểm thử...');

  const testApi = async (role: string, url: string) => {
    const res = await fetch(`${BASE_URL}/api/v1${url}`, {
      headers: { 'Authorization': `Bearer ${users[role].token}` }
    });
    return await res.json();
  };

  // --- TEST CASES ---

  console.log('\n--- 🟢 [CASE 1] Sale xem Quote: Expects to see it');
  const saleRes = await testApi('SALES', '/quotes');
  if (saleRes.items && saleRes.items.length > 0) {
    console.log('✅ PASS: Sale xem được danh sách');
  } else {
    console.error('❌ FAIL: Sale không thấy quote');
  }

  console.log('\n--- 🔴 [CASE 2] Purchasing xem Quote: Expects to skip DRAFT');
  const purRes = await testApi('PURCHASING', '/quotes');
  const foundDraft = purRes.items?.some((q: any) => q.id === quote.id);
  if (foundDraft) {
    console.error('❌ FAIL: Purchasing thấy được Quote ở trạng thái DRAFT!');
  } else {
    console.log('✅ PASS: Purchasing không thấy quote DRAFT.');
  }

  console.log('\n--- 🟡 [CASE 3] Technical xem Quote Detail: Expects prices MASKED');
  const techRes = await testApi('TECHNICAL', `/quotes/${quote.id}`);
  if (techRes.success) {
    const quoteItem = techRes.data.items[0];
    if (quoteItem.targetPrice === null && techRes.data.subTotal === null) {
      console.log('✅ PASS: Giá targetPrice & subTotal đã bị MASKED (Ẩn).');
    } else {
      console.error('❌ FAIL: Giá nhạy cảm vẫn còn hiển thị cho Kỹ thuật!', { targetPrice: quoteItem.targetPrice, total: techRes.data.totalAmount });
    }
  }

  console.log('\n--- 👑 [CASE 4] TL Override Override: Expects prices VISIBLE');
  // Cấp quyền 'view_all_prices' cho Tech
  await prisma.projectMember.updateMany({
    where: { projectId: project.id, userId: users['TECHNICAL'].id },
    data: { permissions: JSON.stringify(['view_all_prices']) }
  });

  const techResOverride = await testApi('TECHNICAL', `/quotes/${quote.id}`);
  if (techResOverride.success) {
    const quoteItem = techResOverride.data.items[0];
    if (quoteItem.targetPrice !== null && quoteItem.targetPrice !== undefined) {
      console.log('✅ PASS: Giá hiển thị do có Override permission của TL.');
    } else {
      console.error('❌ FAIL: Vẫn bị Masked dù đã Override.');
    }
  }

  console.log('\n🏁 4. Cleanup dữ liệu test...');
  await prisma.quoteRequestItem.deleteMany({ where: { quoteRequestId: quote.id } });
  await prisma.quoteRequest.delete({ where: { id: quote.id } });
  await prisma.projectMember.deleteMany({ where: { projectId: project.id } });
  await prisma.project.delete({ where: { id: project.id } });
  await prisma.product.delete({ where: { id: product.id } });
  await prisma.customer.delete({ where: { id: customer.id } });
  for (const roleName of rolesToCheck) {
     await prisma.user.delete({ where: { id: users[roleName].id } });
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
