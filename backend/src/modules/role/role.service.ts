import prisma from '../../database/client.js';

export class RoleService {
  async getAll() {
    return prisma.role.findMany();
  }

  async getById(id: number) {
    return prisma.role.findUnique({
      where: { id }
    });
  }

  async updatePermissions(id: number, permissions: any) {
    return prisma.role.update({
      where: { id },
      data: { permissions: JSON.stringify(permissions) }
    });
  }
}

export const roleService = new RoleService();
