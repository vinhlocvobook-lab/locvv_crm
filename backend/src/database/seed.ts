import prisma from './client.js';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Trình gieo hạt dữ liệu (Seeding) bắt đầu...');

  // 1. Tạo các Roles
  const roles = [
    { name: 'SUPER_ADMIN', permissions: ['*'] },
    { name: 'ADMIN', permissions: ['tenant:manage', 'user:manage'] },
    { name: 'SALES', permissions: ['quote:create', 'quote:view'] },
    { name: 'PURCHASING', permissions: ['quote:price_collect', 'quote:view'] },
    { name: 'TL', permissions: ['quote:approve', 'quote:view', 'dashboard:view'] },
  ];

  for (const role of roles) {
    const permissionsStr = JSON.stringify(role.permissions);
    await prisma.role.upsert({
      where: { name: role.name },
      update: { permissions: permissionsStr },
      create: { name: role.name, permissions: permissionsStr },
    });
  }
  console.log('✅ Đã tạo các vai trò (Roles)');

  // 2. Tạo Tenant mẫu
  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-company' },
    update: {},
    create: {
      name: 'Công ty ABC Demo',
      slug: 'demo-company',
      status: 'active',
      settings: JSON.stringify({ currency: 'VND', vat: 10 }),
    },
  });
  console.log('✅ Đã tạo Tenant mẫu');

  // 3. Tạo User mẫu (Admin)
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  if (adminRole) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.upsert({
      where: {
        tenantId_email: {
          tenantId: demoTenant.id,
          email: 'admin@demo.com',
        },
      },
      update: { password: hashedPassword },
      create: {
        email: 'admin@demo.com',
        password: hashedPassword,
        name: 'Quản trị viên Demo',
        tenantId: demoTenant.id,
        roleId: adminRole.id,
        status: 'active',
      },
    });
    console.log('✅ Đã tạo tài khoản admin mẫu: admin@demo.com / admin123');
  }

  console.log('🏁 Hoàn tất gieo hạt dữ liệu!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
