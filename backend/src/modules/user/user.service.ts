import prisma from '../../database/client.js';
import bcrypt from 'bcryptjs';

export class UserService {
  async getAll(tenantId: string) {
    return prisma.user.findMany({
      where: { tenantId, deletedAt: null },
      include: {
        role: true,
        team: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, tenantId: string) {
    return prisma.user.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        role: true,
        team: true,
      },
    });
  }

  async create(data: {
    email: string;
    password: string;
    name: string;
    tenantId: string;
    roleId: number;
    teamId?: string;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        role: true,
      }
    });
  }

  async update(id: string, tenantId: string, data: any) {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return prisma.user.update({
      where: { id },
      data,
      include: {
        role: true,
      }
    });
  }

  async delete(id: string, tenantId: string) {
    return prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), status: 'inactive' },
    });
  }
}

export const userService = new UserService();
