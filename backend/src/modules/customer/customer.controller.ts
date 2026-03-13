import { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service.js';

const customerService = new CustomerService();

export class CustomerController {
  async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tid;
      const customers = await customerService.getAll(tenantId);
      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  async getCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tenantId = (req as any).user.tid;
      const customer = await customerService.getById(id, tenantId);
      if (!customer) {
        return res.status(404).json({ success: false, error: { message: 'Không tìm thấy khách hàng' } });
      }
      res.json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }

  async createCustomer(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tid;
      const customer = await customerService.create({ ...req.body, tenantId });
      res.status(201).json({ success: true, data: customer });
    } catch (error) {
      next(error);
    }
  }
}
