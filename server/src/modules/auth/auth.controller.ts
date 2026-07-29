import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { registerSchema, loginSchema } from '@astranox/shared';
import { ValidationError, UnauthorizedError } from '../../core/errors/AppError';

export class AuthController {
  private service: AuthService;

  constructor() {
    this.service = new AuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = registerSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.errors[0].message);
      }

      const result = await this.service.register(parsed.data);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid input');
      }

      const { auth, refreshToken } = await this.service.login(parsed.data);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, data: auth });
    } catch (err) {
      next(err);
    }
  };

  refresh = async (req: Request, res: Response, _next: NextFunction) => {
    try {
      const token = req.cookies?.refreshToken;
      if (!token) {
        throw new Error('No refresh token');
      }

      const { auth, refreshToken } = await this.service.refresh(token);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({ success: true, data: auth });
    } catch (err) {
      res.clearCookie('refreshToken');
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Session expired' }});
    }
  };

  logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (userId) {
        await this.service.logout(userId);
      }
      res.clearCookie('refreshToken');
      res.json({ success: true, data: { message: 'Logged out successfully' } });
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

      const { updateProfileSchema } = await import('@astranox/shared');
      const parsed = updateProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError(parsed.error.errors[0].message);
      }

      const result = await this.service.updateProfile(userId, parsed.data);
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
