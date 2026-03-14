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

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tenantId = (req as any).user.tid;
      await productService.update(id, tenantId, req.body);
      res.json({ success: true, message: 'Cập nhật sản phẩm thành công' });
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const tenantId = (req as any).user.tid;
      await productService.delete(id, tenantId);
      res.json({ success: true, message: 'Xóa sản phẩm thành công' });
    } catch (error) {
      next(error);
    }
  }
}
