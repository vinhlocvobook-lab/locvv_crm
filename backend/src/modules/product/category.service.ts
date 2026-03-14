import prisma from '../../database/client.js';

export class CategoryService {
  async getAll(tenantId: string) {
    return prisma.category.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  }

  async create(data: { name: string; description?: string; tenantId: string }) {
    return prisma.category.create({
      data
    });
  }

  async update(id: string, tenantId: string, data: any) {
    return prisma.category.update({
      where: { id, tenantId },
      data
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.category.delete({
      where: { id, tenantId }
    });
  }
}
