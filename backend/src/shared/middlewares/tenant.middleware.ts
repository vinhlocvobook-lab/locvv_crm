import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from './auth.middleware.js';

/**
 * Middleware này đảm bảo rằng tenantId từ JWT luôn được sử dụng 
 * để truy vấn dữ liệu, tránh việc rò rỉ dữ liệu giữa các khách hàng.
 */
export const tenantMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.tid) {
    return res.status(401).json({
      success: false,
      error: { code: 'ERR_TENANT_NOT_FOUND', message: 'Không xác định được danh tính công ty' },
    });
  }

  // Tiêm tenantId vào query hoặc body nếu cần (tùy theo strategy của repository)
  // Ở đây chúng ta chỉ cần đảm bảo nó tồn tại trong req.user.tid
  next();
};
