import { Request, Response, NextFunction } from 'express';
import { ProductService } from './product.service.js';

const productService = new ProductService();

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tid;
      const products = await productService.getAll(tenantId);
      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  }

  async getProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tenantId = (req as any).user.tid;
      const product = await productService.getById(id, tenantId);
      if (!product) {
        return res.status(404).json({ success: false, error: { message: 'Không tìm thấy sản phẩm' } });
      }
      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const tenantId = (req as any).user.tid;
      const product = await productService.create({ ...req.body, tenantId });
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  }
}
