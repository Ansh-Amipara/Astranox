import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { UnauthorizedError } from '../../core/errors/AppError';
import { env } from '../../config/env';
import { getIO } from '../../socket';

@injectable()
export class AuthController {
  constructor(private service: AuthService) {}

  private setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const domain = env.COOKIE_DOMAIN || undefined;

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain,
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      domain,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearAuthCookies(res: Response) {
    const domain = env.COOKIE_DOMAIN || undefined;
    res.clearCookie('accessToken', { path: '/', domain });
    res.clearCookie('refreshToken', { path: '/', domain });
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.register(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const meta = {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      };
      const { auth, refreshToken } = await this.service.login(req.body, meta);

      this.setAuthCookies(res, auth.accessToken, refreshToken);

      res.json({
        success: true,
        data: {
          user: auth.user,
          accessToken: auth.accessToken,
        },
      });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!token) {
        throw new UnauthorizedError('No refresh token provided');
      }

      const meta = {
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      };
      const { auth, refreshToken } = await this.service.refresh(token, meta);

      this.setAuthCookies(res, auth.accessToken, refreshToken);

      res.json({
        success: true,
        data: {
          user: auth.user,
          accessToken: auth.accessToken,
        },
      });
    } catch (err: any) {
      this.clearAuthCookies(res);
      res.status(401).json({
        success: false,
        error: {
          code: err.code || 'UNAUTHORIZED',
          message: err.message || 'Session expired',
        },
      });
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      const userId = req.user?.id;

      await this.service.logout(refreshToken, userId);
      this.clearAuthCookies(res);

      res.json({ success: true, data: { message: 'Logged out successfully' } });
    } catch (err) {
      next(err);
    }
  };

  logoutAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Not authenticated');
      }

      await this.service.logoutAll(userId);
      this.clearAuthCookies(res);

      try {
        const io = getIO();
        io.to(`user:${userId}`).emit('auth:revoked', { message: 'All sessions revoked' });
        io.in(`user:${userId}`).disconnectSockets(true);
      } catch {
        // Socket may not be initialized in test mode
      }

      res.json({ success: true, data: { message: 'All sessions logged out successfully' } });
    } catch (err) {
      next(err);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new UnauthorizedError('Not authenticated');
      }

      const result = await this.service.updateProfile(userId, req.body);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Not authenticated');
      }
      res.json({ success: true, data: req.user });
    } catch (err) {
      next(err);
    }
  };
}
