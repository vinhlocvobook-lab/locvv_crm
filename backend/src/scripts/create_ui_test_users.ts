import prisma from '../database/client.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('👤 Bắt đầu tạo tài khoản kiểm thử Giao diện (UI Testing)...');

  const tenant = await prisma.tenant.findUnique({ where: { slug: 'demo-company' } });
  if (!tenant) {
    throw new Error('Không tìm thấy Tenant mẫu (demo-company). Vui lòng chạy `npx tsx src/database/seed.ts` trước.');
  }

  const roleConfigs = [
    { email: 'sales_demo@test.com', name: 'Sale Demo', role: 'SALES' },
    { email: 'pur_demo@test.com', name: 'Purchasing Demo', role: 'PURCHASING' },
    { email: 'tech_demo@test.com', name: 'Kỹ thuật Demo', role: 'TECHNICAL' },
    { email: 'acc_demo@test.com', name: 'Kế toán Demo', role: 'ACCOUNTANT' },
    { email: 'leader_demo@test.com', name: 'Team Leader Demo', role: 'TL' }
  ];

  const hashedPassword = await bcrypt.hash('password123', 10);

  for (const config of roleConfigs) {
    const role = await prisma.role.findUnique({ where: { name: config.role } });
    if (!role) {
      console.error(`❌ Lỗi: Role ${config.role} chưa tồn tại trong DB.`);
      continue;
    }

    // Upsert để có thể chạy nhiều lần không lỗi
    await prisma.user.upsert({
      where: { tenantId_email: { tenantId: tenant.id, email: config.email } },
      update: { roleId: role.id, password: hashedPassword },
      create: {
        email: config.email,
        password: hashedPassword,
        name: config.name,
        tenantId: tenant.id,
        roleId: role.id,
        status: 'active'
      }
    });

    console.log(`✅ Thành công: [${config.role}] ${config.email} / password123`);
  }

  console.log('🏁 Hoàn tất tạo tài khoản kiểm thử UI!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
