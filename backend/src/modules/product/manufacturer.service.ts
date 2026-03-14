import prisma from '../../database/client.js';

export class ManufacturerService {
  async getAll(tenantId: string) {
    return prisma.manufacturer.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' }
    });
  }

  async create(data: { name: string; description?: string; logoUrl?: string; tenantId: string }) {
    return prisma.manufacturer.create({
      data
    });
  }

  async update(id: string, tenantId: string, data: any) {
    return prisma.manufacturer.update({
      where: { id, tenantId },
      data
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.manufacturer.delete({
      where: { id, tenantId }
    });
  }
}
