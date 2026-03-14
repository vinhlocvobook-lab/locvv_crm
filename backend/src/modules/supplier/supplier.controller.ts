import { Request, Response, NextFunction } from 'express';
import { supplierService } from './supplier.service.js';

export class SupplierController {
  async getSuppliers(req: any, res: Response, next: NextFunction) {
    try {
      const suppliers = await supplierService.getAll(req.user.tid);
      res.json({ success: true, data: suppliers });
    } catch (error) {
      next(error);
    }
  }

  async getSupplier(req: any, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.getById(req.params.id, req.user.tid);
      if (!supplier) {
        return res.status(404).json({ success: false, error: { message: 'Không tìm thấy nhà cung cấp' } });
      }
      res.json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async createSupplier(req: any, res: Response, next: NextFunction) {
    try {
      const supplier = await supplierService.create({ ...req.body, tenantId: req.user.tid });
      res.status(201).json({ success: true, data: supplier });
    } catch (error) {
      next(error);
    }
  }

  async updateSupplier(req: any, res: Response, next: NextFunction) {
    try {
      await supplierService.update(req.params.id, req.user.tid, req.body);
      res.json({ success: true, message: 'Cập nhật nhà cung cấp thành công' });
    } catch (error) {
      next(error);
    }
  }

  async deleteSupplier(req: any, res: Response, next: NextFunction) {
    try {
      await supplierService.delete(req.params.id, req.user.tid);
      res.json({ success: true, message: 'Xóa nhà cung cấp thành công' });
    } catch (error) {
      next(error);
    }
  }
}

export const supplierController = new SupplierController();
