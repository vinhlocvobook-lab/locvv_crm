import { Request, Response, NextFunction } from 'express';
import { quoteService } from './quote.service.js';

export class QuoteController {
  async create(req: any, res: Response, next: NextFunction) {
    try {
      const { customerId, items, currency, expiryDate, approvalDeadline, purchasingDeadline, subTotal, taxAmount } = req.body;
      const result = await quoteService.createQuote({
        tenantId: req.user.tid,
        salesId: req.user.uid,
        customerId,
        items,
        currency,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        approvalDeadline: approvalDeadline ? new Date(approvalDeadline) : undefined,
        purchasingDeadline: purchasingDeadline ? new Date(purchasingDeadline) : undefined,
        subTotal,
        taxAmount
      });
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async update(req: any, res: Response, next: NextFunction) {
    try {
      const { items, currency, expiryDate, approvalDeadline, purchasingDeadline, subTotal, taxAmount } = req.body;
      const result = await quoteService.updateQuote(req.params.id, req.user.tid, {
        items,
        currency,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        approvalDeadline: approvalDeadline ? new Date(approvalDeadline) : undefined,
        purchasingDeadline: purchasingDeadline ? new Date(purchasingDeadline) : undefined,
        subTotal,
        taxAmount
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAll(req: any, res: Response, next: NextFunction) {
    try {
      const { status, salesId, customerId, page, limit } = req.query;
      const result = await quoteService.getQuotes({
        tenantId: req.user.tid,
        status: status as string,
        salesId: salesId as string,
        customerId: customerId as string,
        role: req.user.role, 
        userId: req.user.uid,
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      });
      res.json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }

  async getOne(req: any, res: Response, next: NextFunction) {
    try {
      const result = await quoteService.getQuoteById(req.params.id, req.user.tid, req.user.role, req.user.uid);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submit(req: any, res: Response, next: NextFunction) {
    try {
      const result = await quoteService.updateStatus(req.params.id, req.user.tid, 'REQUESTING_SUPPLIER_PRICE');
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async submitSupplierQuote(req: any, res: Response, next: NextFunction) {
    try {
      const { supplierId, items, currency } = req.body;
      const result = await quoteService.submitSupplierQuote({
        tenantId: req.user.tid,
        quoteRequestId: req.params.id,
        supplierId,
        purchasingId: req.user.uid,
        items,
        currency,
      });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async approve(req: any, res: Response, next: NextFunction) {
    try {
      const { finalPrices } = req.body;
      const result = await quoteService.approveQuote(req.params.id, req.user.tid, { finalPrices });
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const quoteController = new QuoteController();
