import prisma from '../../database/client.js';

export class ProjectService {
  async createProject(data: {
    tenantId: string;
    name: string;
    description?: string;
    customerId: string;
    members: Array<{ userId: string; role: 'SALES' | 'TEAM_LEADER' | 'PURCHASING' | 'TECHNICAL' | 'ACCOUNTANT', permissions?: string[] }>;
  }) {
    const { tenantId, name, description, customerId, members } = data;
    
    return await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name,
          description,
          tenant: { connect: { id: tenantId } },
          customer: { connect: { id: customerId } },
          members: {
            create: members.map(m => ({
              userId: m.userId,
              role: m.role,
              permissions: m.permissions ? JSON.stringify(m.permissions) : null
            }))
          }
        },
        include: {
          members: {
            include: {
              user: {
                select: { id: true, name: true, email: true }
              }
            }
          }
        }
      });
      return project;
    });
  }

  async getProjects(filters: {
    tenantId: string;
    status?: string;
    userId?: string; 
    customerId?: string;
  }) {
    const { tenantId, status, userId, customerId } = filters;
    const where: any = { tenantId, deletedAt: null };
    
    if (status) where.status = status;
    if (customerId) where.customerId = customerId;
    if (userId) {
      where.members = { some: { userId } };
    }

    return await prisma.project.findMany({
      where,
      include: {
        customer: true,
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        _count: {
          select: { quotes: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getProjectById(id: string, tenantId: string) {
    const project = await prisma.project.findFirst({
      where: { id, tenantId, deletedAt: null },
      include: {
        customer: true,
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } }
          }
        },
        quotes: {
          include: {
            sales: { select: { id: true, name: true } },
            customerQuotes: { select: { id: true, status: true, versionLabel: true } },
            items: { include: { product: true } }
          }
        }
      }
    });

    if (!project) {
      throw { status: 404, message: 'Không tìm thấy Project' };
    }

    return project;
  }

  async getProjectDashboard(tenantId: string) {
    const [total, open, closed] = await Promise.all([
      prisma.project.count({ where: { tenantId, deletedAt: null } }),
      prisma.project.count({ where: { tenantId, status: 'OPEN', deletedAt: null } }),
      prisma.project.count({ where: { tenantId, status: 'CLOSED', deletedAt: null } }),
    ]);

    const wonQuotesCount = await prisma.customerQuote.count({
      where: {
        quoteRequest: { tenantId },
        status: 'ACCEPTED'
      }
    });

    const pendingQuotesCount = await prisma.customerQuote.count({
      where: {
        quoteRequest: { tenantId },
        status: 'WAITING_APPROVAL'
      }
    });

    return {
      total,
      open,
      closed,
      wonQuotesCount,
      pendingQuotesCount
    };
  }

  async updateMemberPermissions(projectId: string, userId: string, permissions: string[]) {
    return await prisma.projectMember.updateMany({
      where: { projectId, userId },
      data: { permissions: JSON.stringify(permissions) }
    });
  }
}

export const projectService = new ProjectService();
