import prisma from '../../database/client.js';
import { Decimal } from '@prisma/client/runtime/library';

export class QuoteService {
  async createQuote(data: {
    tenantId: string;
    salesId: string;
    customerId: string;
    items: Array<{ productId: string; quantity: number; targetPrice: number; priceExpiry?: Date | string }>;
    currency?: string;
    expiryDate?: Date;
    approvalDeadline?: Date;
    purchasingDeadline?: Date;
  }) {
    const { 
      tenantId, 
      salesId, 
      customerId, 
      items, 
      currency = 'VND', 
      expiryDate, 
      approvalDeadline, 
      purchasingDeadline 
    } = data;
    
    // Ensure empty strings are handled as null
    const checkDate = (d: any) => d === '' ? null : d;
    const cleanExpiryDate = checkDate(expiryDate);
    const cleanApprovalDeadline = checkDate(approvalDeadline);
    const cleanPurchasingDeadline = checkDate(purchasingDeadline);

    // Ensure dates are actual Date objects if they come as strings
    const finalExpiryDate = cleanExpiryDate && typeof cleanExpiryDate === 'string' ? new Date(cleanExpiryDate) : cleanExpiryDate;
    const finalApprovalDeadline = cleanApprovalDeadline && typeof cleanApprovalDeadline === 'string' ? new Date(cleanApprovalDeadline) : cleanApprovalDeadline;
    const finalPurchasingDeadline = cleanPurchasingDeadline && typeof cleanPurchasingDeadline === 'string' ? new Date(cleanPurchasingDeadline) : cleanPurchasingDeadline;

    // Use transaction to ensure data integrity
    return await prisma.$transaction(async (tx) => {
      // Calculate total amount
      const totalAmount = items.reduce(
        (acc, item) => acc + (item.quantity * item.targetPrice),
        0
      );

      // Create the Quote Request
      const quote = await tx.quoteRequest.create({
        data: {
          tenantId,
          salesId,
          customerId,
          status: 'DRAFT',
          totalAmount: new Decimal(totalAmount),
          currency,
          expiryDate: finalExpiryDate,
          approvalDeadline: finalApprovalDeadline,
          purchasingDeadline: finalPurchasingDeadline,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: new Decimal(item.quantity),
              targetPrice: new Decimal(item.targetPrice),
              priceExpiry: item.priceExpiry ? new Date(item.priceExpiry) : null,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
          sales: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return quote;
    });
  }

  async updateQuote(id: string, tenantId: string, data: {
    items: Array<{ productId: string; quantity: number; targetPrice: number; priceExpiry?: Date | string }>;
    currency?: string;
    expiryDate?: Date;
    approvalDeadline?: Date;
    purchasingDeadline?: Date;
  }) {
    const existingQuote = await prisma.quoteRequest.findFirst({
        where: { id, tenantId, deletedAt: null }
    });

    if (!existingQuote) {
        throw { status: 404, message: 'Không tìm thấy báo giá' };
    }

    if (existingQuote.status !== 'DRAFT') {
        throw { status: 400, message: 'Chỉ có thể sửa báo giá ở trạng thái Nháp' };
    }

    const { items, currency, expiryDate, approvalDeadline, purchasingDeadline } = data;

    const checkDate = (d: any) => d === '' ? null : d;
    const finalExpiryDate = checkDate(expiryDate) ? new Date(checkDate(expiryDate)) : null;
    const finalApprovalDeadline = checkDate(approvalDeadline) ? new Date(checkDate(approvalDeadline)) : null;
    const finalPurchasingDeadline = checkDate(purchasingDeadline) ? new Date(checkDate(purchasingDeadline)) : null;

    return await prisma.$transaction(async (tx) => {
        const totalAmount = items.reduce(
            (acc, item) => acc + (item.quantity * item.targetPrice),
            0
        );

        // Delete all old items
        await tx.quoteRequestItem.deleteMany({
            where: { quoteRequestId: id }
        });

        // Update the quote and create new items
        const updatedQuote = await tx.quoteRequest.update({
            where: { id },
            data: {
                totalAmount: new Decimal(totalAmount),
                currency: currency || existingQuote.currency,
                expiryDate: finalExpiryDate,
                approvalDeadline: finalApprovalDeadline,
                purchasingDeadline: finalPurchasingDeadline,
                items: {
                    create: items.map((item) => ({
                        productId: item.productId,
                        quantity: new Decimal(item.quantity),
                        targetPrice: new Decimal(item.targetPrice),
                        priceExpiry: item.priceExpiry ? new Date(item.priceExpiry) : null,
                    }))
                }
            },
            include: {
                items: { include: { product: true } },
                customer: true,
                sales: { select: { id: true, name: true, email: true } },
            }
        });

        return updatedQuote;
    });
  }

  async getQuotes(filters: {
    tenantId: string;
    status?: string;
    salesId?: string;
    customerId?: string;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, status, salesId, customerId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    if (status) where.status = status;
    if (salesId) where.salesId = salesId;
    if (customerId) where.customerId = customerId;

    const [total, items] = await Promise.all([
      prisma.quoteRequest.count({ where }),
      prisma.quoteRequest.findMany({
        where,
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
          sales: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuoteById(id: string, tenantId: string) {
    const quote = await prisma.quoteRequest.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        sales: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
        },
        supplierQuotes: {
          include: {
            supplier: true,
            items: true,
          },
        },
      },
    });

    if (!quote) {
      throw { status: 404, message: 'Không tìm thấy yêu cầu báo giá' };
    }

    return quote;
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    // Basic status transition validation could be added here
    return await prisma.quoteRequest.update({
      where: { id, tenantId },
      data: { status },
    });
  }

  /**
   * Submit prices from a specific supplier for a quote request
   */
  async submitSupplierQuote(data: {
    tenantId: string;
    quoteRequestId: string;
    supplierId: string;
    purchasingId: string;
    items: Array<{ productId: string; quantity: number; unitPrice: number }>;
    currency?: string;
  }) {
    const { tenantId, quoteRequestId, supplierId, purchasingId, items, currency = 'VND' } = data;

    return await prisma.$transaction(async (tx) => {
      const totalAmount = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);

      // 1. Create the Supplier Quote
      const supplierQuote = await tx.supplierQuote.create({
        data: {
          quoteRequestId,
          supplierId,
          purchasingId,
          totalAmount: new Decimal(totalAmount),
          currency,
          status: 'RECEIVED',
          items: {
            create: items.map(item => ({
              productId: item.productId,
              quantity: new Decimal(item.quantity),
              unitPrice: new Decimal(item.unitPrice),
            }))
          }
        }
      });

      // 2. Update Quote Request status to reflect progress
      await tx.quoteRequest.update({
        where: { id: quoteRequestId, tenantId },
        data: { status: 'SUPPLIER_PRICE_COLLECTED' }
      });

      return supplierQuote;
    });
  }

  /**
   * Final approval by Team Leader
   */
  async approveQuote(id: string, tenantId: string, data: {
    finalPrices: Array<{ productId: string; price: number }>;
  }) {
    return await prisma.$transaction(async (tx) => {
      // Update each item with final selling price
      for (const item of data.finalPrices) {
        await tx.quoteRequestItem.updateMany({
          where: { 
            quoteRequestId: id,
            productId: item.productId 
          },
          data: { finalPrice: new Decimal(item.price) }
        });
      }

      const totalAmount = data.finalPrices.reduce((acc, item) => acc + item.price, 0);

      return await tx.quoteRequest.update({
        where: { id, tenantId },
        data: { 
          status: 'APPROVED',
          totalAmount: new Decimal(totalAmount)
        }
      });
    });
  }
}

export const quoteService = new QuoteService();
