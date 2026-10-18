import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { AdminEventsService } from './admin-events.service';

@injectable()
export class AdminEventsController {
  constructor(private service: AdminEventsService) {}

  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isArchived } = req.query as Record<string, string>;
      const events = await this.service.getAllEvents(isArchived);
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const event = await this.service.createEvent(adminId, req.body, requestId);
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { id } = req.params;
      const event = await this.service.updateEvent(adminId, id, req.body, requestId);
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  archiveEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { id } = req.params;
      const { reason } = req.body;
      const event = await this.service.archiveEvent(adminId, id, reason, requestId);
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  unarchiveEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = (req as any).user.id;
      const requestId = (req as any).id;
      const { id } = req.params;
      const { reason } = req.body;
      const event = await this.service.unarchiveEvent(adminId, id, reason, requestId);
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };
}
