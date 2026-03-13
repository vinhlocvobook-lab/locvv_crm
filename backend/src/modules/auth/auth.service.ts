import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../database/client.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m'; // Default 15 mins for access token
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-refresh-secret-key';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'; // Default 7 days for refresh token

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
      { expiresIn: JWT_EXPIRES_IN as any }
    );

    const refreshToken = jwt.sign(
      { uid: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: JWT_REFRESH_EXPIRES_IN as any }
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
      accessToken: token,
      refreshToken,
    };
  }

  async verifyRefreshToken(token: string) {
    try {
      const decoded = jwt.verify(token, JWT_REFRESH_SECRET) as any;
      const user = await prisma.user.findUnique({
        where: { id: decoded.uid },
        include: { tenant: true, role: true },
      });

      if (!user || user.status !== 'active' || user.tenant.status !== 'active') {
        throw new Error('User inactive or not found');
      }

      const newAccessToken = jwt.sign(
        {
          uid: user.id,
          tid: user.tenantId,
          role: user.role.name,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN as any }
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      throw { status: 401, message: 'Refresh token không hợp lệ hoặc đã hết hạn', code: 'ERR_AUTH_INVALID_REFRESH' };
    }
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
