import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/db/prisma';

@injectable()
export class AdminAnnouncementsController {
  getAnnouncements = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const announcements = await prisma.announcement.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json({
        success: true,
        data: announcements.map((a) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          type: a.type,
          active: a.active,
          createdBy: a.createdBy,
          createdAt: a.createdAt.toISOString(),
          expiresAt: a.expiresAt ? a.expiresAt.toISOString() : null,
        })),
      });
    } catch (error) {
      next(error);
    }
  };

  createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, message, type, expiresAt } = req.body;
      const announcement = await prisma.announcement.create({
        data: {
          title,
          message,
          type: type || 'info',
          active: true,
          createdBy: req.user!.id,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        },
      });

      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'ANNOUNCEMENT_CREATE',
          entityType: 'ANNOUNCEMENT',
          entityId: announcement.id,
          reason: `Created announcement: ${title}`,
          afterValues: { title, message, type },
        },
      });

      res.status(201).json({ success: true, data: announcement });
    } catch (error) {
      next(error);
    }
  };

  deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await prisma.announcement.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          adminId: req.user!.id,
          action: 'ANNOUNCEMENT_DELETE',
          entityType: 'ANNOUNCEMENT',
          entityId: id,
          reason: 'Deleted announcement',
        },
      });

      res.json({ success: true, data: { id } });
    } catch (error) {
      next(error);
    }
  };
}
