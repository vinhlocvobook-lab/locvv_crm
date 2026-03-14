import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service.js';

export class UserController {
  async getUsers(req: any, res: Response, next: NextFunction) {
    try {
      const users = await userService.getAll(req.user.tid);
      res.json({ success: true, data: users });
    } catch (error) {
      next(error);
    }
  }

  async getUser(req: any, res: Response, next: NextFunction) {
    try {
      const user = await userService.getById(req.params.id, req.user.tid);
      if (!user) {
        return res.status(404).json({ success: false, error: { message: 'Không tìm thấy người dùng' } });
      }
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async createUser(req: any, res: Response, next: NextFunction) {
    try {
      const user = await userService.create({ ...req.body, tenantId: req.user.tid });
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req: any, res: Response, next: NextFunction) {
    try {
      const user = await userService.update(req.params.id, req.user.tid, req.body);
      res.json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req: any, res: Response, next: NextFunction) {
    try {
      await userService.delete(req.params.id, req.user.tid);
      res.json({ success: true, message: 'Đã xóa người dùng thành công' });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();
