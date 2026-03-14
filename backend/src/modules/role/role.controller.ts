import { Request, Response, NextFunction } from 'express';
import { roleService } from './role.service.js';

export class RoleController {
  async getRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const roles = await roleService.getAll();
      const formattedRoles = roles.map(r => ({
        ...r,
        permissions: typeof r.permissions === 'string' ? JSON.parse(r.permissions) : r.permissions
      }));
      res.json({ success: true, data: formattedRoles });
    } catch (error) {
      next(error);
    }
  }

  async updateRole(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { permissions } = req.body;
      const role = await roleService.updatePermissions(parseInt(id as string), permissions);
      const formattedRole = {
        ...role,
        permissions: typeof role.permissions === 'string' ? JSON.parse(role.permissions) : role.permissions
      };
      res.json({ success: true, data: formattedRole });
    } catch (error) {
      next(error);
    }
  }
}

export const roleController = new RoleController();
