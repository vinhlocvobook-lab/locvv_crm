import prisma from '../../database/client.js';

export class ProductService {
  async getAll(tenantId: string) {
    return prisma.product.findMany({
      where: { tenantId, deletedAt: null }
    });
  }

  async getById(id: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null }
    });
  }

  async create(data: { name: string; sku: string; description?: string; basePrice: number; tenantId: string }) {
    return prisma.product.create({
      data: {
        ...data,
        basePrice: data.basePrice.toString() as any // Prisma Decimal expects string or number
      }
    });
  }

  async update(id: string, tenantId: string, data: any) {
    if (data.basePrice) data.basePrice = data.basePrice.toString();
    return prisma.product.updateMany({
      where: { id, tenantId },
      data
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.product.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
  }
}
