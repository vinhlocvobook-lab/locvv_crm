import prisma from '../../database/client.js';

export class CustomerService {
  async getAll(tenantId: string) {
    return prisma.customer.findMany({
      where: { tenantId, deletedAt: null }
    });
  }

  async getById(id: string, tenantId: string) {
    return prisma.customer.findFirst({
      where: { id, tenantId, deletedAt: null }
    });
  }

  async create(data: { name: string; email?: string; phone?: string; address?: string; taxCode?: string; tenantId: string }) {
    return prisma.customer.create({
      data
    });
  }

  async update(id: string, tenantId: string, data: any) {
    return prisma.customer.updateMany({
      where: { id, tenantId },
      data
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.customer.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
  }
}
