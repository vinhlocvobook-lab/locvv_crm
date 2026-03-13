import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_EXPIRES_IN = '1d';

export class AuthService {
  async register(data: any) {
    const { email, password, name, tenantId, roleId } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        tenantId,
        roleId,
      },
      include: {
        tenant: true,
        role: true,
      },
    });

    return user;
  }

  async login(email: string, password: string) {
    const user = await prisma.user.findFirst({
      where: { email },
      include: {
        tenant: true,
        role: true,
      },
    });

    if (!user) {
      throw { status: 401, message: 'Email hoặc mật khẩu không đúng', code: 'ERR_AUTH_INVALID' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw { status: 401, message: 'Email hoặc mật khẩu không đúng', code: 'ERR_AUTH_INVALID' };
    }

    if (user.status !== 'active' || user.tenant.status !== 'active') {
      throw { status: 403, message: 'Tài khoản hoặc công ty đã bị khóa', code: 'ERR_AUTH_FORBIDDEN' };
    }

    const token = jwt.sign(
      {
        uid: user.id,
        tid: user.tenantId,
        role: user.role.name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug,
        },
      },
      token,
    };
  }

  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        tenant: true,
        role: true,
      },
    });

    if (!user) {
      throw { status: 404, message: 'Không tìm thấy người dùng', code: 'ERR_USER_NOT_FOUND' };
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role.name,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        slug: user.tenant.slug,
      },
    };
  }
}

export const authService = new AuthService();
