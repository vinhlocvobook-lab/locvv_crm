import prisma from '../database/client.js';

async function main() {
  const project = await prisma.project.findFirst({
     where: { name: 'Dự án Toà nhà Horizon (Verify Permissions)' }
  });
  const techUser = await prisma.user.findFirst({
     where: { email: 'tech_demo@test.com' }
  });

  if (!project || !techUser) {
     console.error("❌ Không tìm thấy Dự án hoặc Tài khoản Kỹ thuật. Vui lòng chạy setup_ui_test_scenario trước.");
     return;
  }

  await prisma.projectMember.updateMany({
    where: { projectId: project.id, userId: techUser.id },
    data: { permissions: JSON.stringify(['view_all_prices']) }
  });

  console.log("✅ Đã cấp quyền `view_all_prices` cho Kỹ thuật viên mẫu thành công!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
