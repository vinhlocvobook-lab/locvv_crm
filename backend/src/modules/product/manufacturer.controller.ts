import { Request, Response, NextFunction } from 'express';
import { ManufacturerService } from './manufacturer.service.js';

const manufacturerService = new ManufacturerService();

export class ManufacturerController {
  async getManufacturers(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tid;
      const manufacturers = await manufacturerService.getAll(tenantId);
      res.json({ success: true, data: manufacturers });
    } catch (error) {
      next(error);
    }
  }

  async createManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tid;
      const manufacturer = await manufacturerService.create({ ...req.body, tenantId });
      res.status(201).json({ success: true, data: manufacturer });
    } catch (error) {
      next(error);
    }
  }

  async updateManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tenantId = (req as any).user.tid;
      const manufacturer = await manufacturerService.update(id, tenantId, req.body);
      res.json({ success: true, data: manufacturer });
    } catch (error) {
      next(error);
    }
  }

  async deleteManufacturer(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tenantId = (req as any).user.tid;
      await manufacturerService.delete(id, tenantId);
      res.json({ success: true, message: 'Manufacturer deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}
