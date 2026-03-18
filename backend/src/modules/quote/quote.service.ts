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
    subTotal?: number;
    taxAmount?: number;
  }) {
    const { 
      tenantId, 
      salesId, 
      customerId, 
      items, 
      currency = 'VND', 
      expiryDate, 
      approvalDeadline, 
      purchasingDeadline,
      subTotal,
      taxAmount
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

      const calculatedTotal = subTotal !== undefined && taxAmount !== undefined ? (subTotal + taxAmount) : totalAmount;
      const finalSubTotal = subTotal !== undefined ? subTotal : totalAmount;
      const finalTaxAmount = taxAmount !== undefined ? taxAmount : 0;

      // Create the Quote Request
      const quote = await tx.quoteRequest.create({
        data: {
          tenantId,
          salesId,
          customerId,
          status: 'DRAFT',
          totalAmount: new Decimal(calculatedTotal),
          subTotal: new Decimal(finalSubTotal),
          taxAmount: new Decimal(finalTaxAmount),
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
    subTotal?: number;
    taxAmount?: number;
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

    const { items, currency, expiryDate, approvalDeadline, purchasingDeadline, subTotal, taxAmount } = data;

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

        const calculatedTotal = subTotal !== undefined && taxAmount !== undefined ? (subTotal + taxAmount) : totalAmount;
        const finalSubTotal = subTotal !== undefined ? subTotal : totalAmount;
        const finalTaxAmount = taxAmount !== undefined ? taxAmount : 0;

        // Update the quote and create new items
        const updatedQuote = await tx.quoteRequest.update({
            where: { id },
            data: {
                totalAmount: new Decimal(calculatedTotal),
                subTotal: new Decimal(finalSubTotal),
                taxAmount: new Decimal(finalTaxAmount),
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
                items: { include: { product: { include: { prices: { take: 1, orderBy: { createdAt: 'desc' } } } } } },
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
    role?: string;
    userId?: string;
    page?: number;
    limit?: number;
  }) {
    const { tenantId, status, salesId, customerId, role, userId, page = 1, limit = 10 } = filters;
    const skip = (page - 1) * limit;

    const where: any = { tenantId, deletedAt: null };
    
    // Phân quyền nâng cao (Row-Level Security)
    if (role === 'SALES' && userId) {
      where.salesId = userId;
    } else if (role === 'PURCHASING') {
      where.status = { not: 'DRAFT' }; // Chỉ thấy khi đã submit
    } else if ((role === 'TECHNICAL' || role === 'ACCOUNTANT') && userId) {
      where.project = { members: { some: { userId } } };
    }

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
              product: { include: { prices: { take: 1, orderBy: { createdAt: 'desc' } } } },
            },
          },
          sales: {
            select: {
              id: true,
              name: true,
            },
          },
          project: {
            include: {
              members: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return {
      items: items.map(item => this.maskQuoteRequest(item, role, userId)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getQuoteById(id: string, tenantId: string, role?: string, userId?: string) {
    const where: any = { id, tenantId, deletedAt: null };

    // Phân quyền nâng cao (Row-Level Security)
    if (role === 'SALES' && userId) {
      where.salesId = userId;
    } else if (role === 'PURCHASING') {
      where.status = { not: 'DRAFT' };
    } else if ((role === 'TECHNICAL' || role === 'ACCOUNTANT') && userId) {
      where.project = { members: { some: { userId } } };
    }

    const quote = await prisma.quoteRequest.findFirst({
      where,
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
            product: { include: { prices: { take: 1, orderBy: { createdAt: 'desc' } } } },
          },
        },
        customerQuotes: {
          orderBy: { createdAt: 'desc' },
        },
        supplierQuotes: {
          include: {
            supplier: true,
            items: true,
          },
        },
        project: {
          include: {
            members: true
          }
        }
      },
    });

    if (!quote) {
      throw { status: 404, message: 'Không tìm thấy yêu cầu báo giá' };
    }

    return this.maskQuoteRequest(quote, role, userId);
  }

  async updateStatus(id: string, tenantId: string, status: string) {
    const existing = await prisma.quoteRequest.findFirst({
      where: { id, tenantId }
    });

    if (!existing) {
      throw { status: 404, message: 'Không tìm thấy Yêu cầu báo giá' };
    }

    const allowedTransitions: { [key: string]: string[] } = {
      DRAFT: ['SUBMITTED_TO_PURCHASING'],
      SUBMITTED_TO_PURCHASING: ['PURCHASING_RECEIVED'],
      PURCHASING_RECEIVED: ['PURCHASING_SOURCING'],
      PURCHASING_SOURCING: ['PURCHASING_DONE'],
      PURCHASING_DONE: ['SENT_TO_TL'],
      SENT_TO_TL: ['TL_REVIEWING'],
      TL_REVIEWING: ['TL_APPROVED', 'TL_REJECTED', 'CLOSED'],
      TL_APPROVED: ['DRAFT'], // To allow generating CustomerQuote next
      TL_REJECTED: ['PURCHASING_SOURCING'],
    };

    const allowed = allowedTransitions[existing.status];
    if (allowed && !allowed.includes(status)) {
      throw { status: 400, message: `Không thể chuyển từ ${existing.status} sang ${status}` };
    }

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
    items: Array<{ productId: string; quantity: number; unitPrice: number; originalPrice?: number; discountPercent?: number; taxRate?: number; }>;
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
              originalPrice: item.originalPrice !== undefined ? new Decimal(item.originalPrice) : null,
              discountPercent: item.discountPercent !== undefined ? new Decimal(item.discountPercent) : null,
              taxRate: item.taxRate !== undefined ? new Decimal(item.taxRate) : null,
            }))
          }
        },
        include: { items: true }
      });

      // 2. Auto-save prices to ProductPrice history
      for (const item of supplierQuote.items) {
        await tx.productPrice.create({
          data: {
            tenantId,
            productId: item.productId,
            supplierId,
            originalPrice: item.originalPrice || item.unitPrice,
            discountPercent: item.discountPercent,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate,
            currency,
            source: 'supplier_quote',
            sourceRefId: item.id,
          }
        });
      }

      // 3. Update Quote Request status to reflect progress
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

  maskQuoteRequest(quote: any, role?: string, userId?: string) {
    if (!role) return quote;
    
    // Kiểm tra quyền ghi đè (override) trong dự án
    if (quote.project && quote.project.members && userId) {
      const member = quote.project.members.find((m: any) => m.userId === userId);
      if (member && member.permissions) {
        try {
          const extraPerms = JSON.parse(member.permissions);
          if (extraPerms.includes('view_all_prices')) {
            return quote; // Bỏ qua mặt nạ bảo mật
          }
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    if (role === 'TECHNICAL') {
      if (quote.items) {
        quote.items = quote.items.map((item: any) => ({
          ...item,
          targetPrice: null,
          finalPrice: null
        }));
      }
      quote.subTotal = null;
      quote.taxAmount = null;
      quote.totalAmount = null;
    }
    return quote;
  }
}

export const quoteService = new QuoteService();
