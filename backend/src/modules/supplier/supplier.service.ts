import prisma from '../../database/client.js';

export class SupplierService {
  async getAll(tenantId: string) {
    return prisma.supplier.findMany({
      where: { tenantId, deletedAt: null },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getById(id: string, tenantId: string) {
    return prisma.supplier.findFirst({
      where: { id, tenantId, deletedAt: null }
    });
  }

  async create(data: { 
    name: string; 
    email?: string; 
    phone?: string; 
    address?: string; 
    taxCode?: string; 
    tenantId: string 
  }) {
    return prisma.supplier.create({
      data
    });
  }

  async update(id: string, tenantId: string, data: any) {
    return prisma.supplier.updateMany({
      where: { id, tenantId },
      data
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.supplier.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
  }
}

export const supplierService = new SupplierService();
