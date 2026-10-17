import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/db/prisma';

@injectable()
export class AdminAuditController {
  getAuditLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
      const skip = (page - 1) * limit;

      const where: any = {};
      if (req.query.adminId) where.adminId = req.query.adminId as string;
      if (req.query.action) where.action = req.query.action as string;
      if (req.query.entityType) where.entityType = req.query.entityType as string;

      if (req.query.startDate || req.query.endDate) {
        where.createdAt = {};
        if (req.query.startDate) where.createdAt.gte = new Date(req.query.startDate as string);
        if (req.query.endDate) where.createdAt.lte = new Date(req.query.endDate as string);
      }

      if (req.query.format === 'csv') {
        const allLogs = await prisma.auditLog.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 1000,
        });

        const headers = ['ID', 'Admin ID', 'Action', 'Entity Type', 'Entity ID', 'Reason', 'Created At'];
        const csvRows = [headers.join(',')];
        for (const log of allLogs) {
          const row = [
            `"${log.id}"`,
            `"${log.adminId}"`,
            `"${log.action}"`,
            `"${log.entityType}"`,
            `"${log.entityId || ''}"`,
            `"${(log.reason || '').replace(/"/g, '""')}"`,
            `"${log.createdAt.toISOString()}"`,
          ];
          csvRows.push(row.join(','));
        }

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="audit_logs.csv"');
        return res.send(csvRows.join('\n'));
      }

      const [total, logs] = await prisma.$transaction([
        prisma.auditLog.count({ where }),
        prisma.auditLog.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
        }),
      ]);

      const adminIds = Array.from(
        new Set(
          logs
            .map((l) => (l as any).actorId || l.adminId)
            .filter((id): id is string => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id))
        )
      );
      const admins = adminIds.length > 0
        ? await prisma.user.findMany({
            where: { id: { in: adminIds } },
            select: { id: true, username: true },
          })
        : [];
      const adminMap = new Map(admins.map((a) => [a.id, a.username]));

      const items = logs.map((l) => {
        const actor = l.adminId || (l as any).actorId;
        return {
          id: l.id,
          adminId: actor || null,
          adminUsername: (actor ? adminMap.get(actor) : undefined) || 'Staff',
          action: l.action,
          entityType: l.entityType,
          entityId: l.entityId,
          reason: l.reason,
          requestId: l.requestId,
          beforeValues: l.beforeValues,
          afterValues: l.afterValues,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt.toISOString(),
        };
      });

      res.json({
        success: true,
        data: items,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
