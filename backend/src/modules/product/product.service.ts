import prisma from '../../database/client.js';
// Force reload Prisma Client

export class ProductService {
  async getAll(tenantId: string) {
    return prisma.product.findMany({
      where: { tenantId, deletedAt: null },
      include: { 
        supplier: true,
        category: true,
        manufacturer: true
      }
    });
  }

  async getById(id: string, tenantId: string) {
    return prisma.product.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: { 
        supplier: true,
        category: true,
        manufacturer: true
      }
    });
  }

  async create(data: any) {
    const { category, manufacturer, ...createData } = data;
    
    // Handle optional fields: convert empty strings to null
    const optionalFields = [
      'priceExpiry', 'categoryId', 'manufacturerId', 'supplierId',
      'leadTime', 'taxRate', 'publicPrice', 'exchangeRate', 'priceUsd'
    ];
    optionalFields.forEach(field => {
      if (createData[field] === '') {
        createData[field] = null;
      }
    });

    if (createData.priceExpiry && typeof createData.priceExpiry === 'string') {
      createData.priceExpiry = new Date(createData.priceExpiry);
    }
    
    // Convert numeric fields to Decimal-compatible format
    const decimalFields = ['basePrice', 'taxRate', 'publicPrice', 'exchangeRate', 'priceUsd'];
    decimalFields.forEach(field => {
        if (createData[field] !== undefined && createData[field] !== null) {
            createData[field] = createData[field].toString();
        }
    });

    return prisma.product.create({
      data: {
        ...createData
      }
    });
  }

  async update(id: string, tenantId: string, data: any) {
    const { category, manufacturer, ...updateData } = data;

    // Handle optional fields: convert empty strings to null
    const optionalFields = [
        'priceExpiry', 'categoryId', 'manufacturerId', 'supplierId',
        'leadTime', 'taxRate', 'publicPrice', 'exchangeRate', 'priceUsd'
    ];
    optionalFields.forEach(field => {
      if (updateData[field] === '') {
        updateData[field] = null;
      }
    });

    if (updateData.priceExpiry && typeof updateData.priceExpiry === 'string') {
      updateData.priceExpiry = new Date(updateData.priceExpiry);
    }

    // Convert numeric fields to Decimal-compatible format
    const decimalFields = ['basePrice', 'taxRate', 'publicPrice', 'exchangeRate', 'priceUsd'];
    decimalFields.forEach(field => {
        if (updateData[field] !== undefined && updateData[field] !== null) {
            updateData[field] = updateData[field].toString();
        }
    });
    
    return prisma.product.updateMany({
      where: { id, tenantId },
      data: updateData
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.product.updateMany({
      where: { id, tenantId },
      data: { deletedAt: new Date() }
    });
  }
}
