import { Response, NextFunction } from 'express';
import { projectService } from './project.service.js';

export class ProjectController {
  async createProject(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tid; 
      const project = await projectService.createProject({
        tenantId,
        ...req.body
      });
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async getProjects(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tid;
      const { status, customerId, userId } = req.query;
      const projects = await projectService.getProjects({
        tenantId,
        status: status as string,
        customerId: customerId as string,
        userId: userId as string
      });
      res.json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  async getProjectById(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tid;
      const project = await projectService.getProjectById(req.params.id, tenantId);
      res.json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  async getProjectDashboard(req: any, res: Response, next: NextFunction) {
    try {
      const tenantId = req.user.tid;
      const dashboard = await projectService.getProjectDashboard(tenantId);
      res.json({ success: true, data: dashboard });
    } catch (error) {
      next(error);
    }
  }
  async updateMemberPermissions(req: any, res: Response, next: NextFunction) {
    try {
      const { id, userId } = req.params;
      const { permissions } = req.body;
      const result = await projectService.updateMemberPermissions(id, userId, permissions);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();
