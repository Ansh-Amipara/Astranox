import { injectable } from 'tsyringe';
import { Request, Response, NextFunction } from 'express';
import { EventsRepository } from '../events/events.repository';

@injectable()
export class AdminEventsController {
  constructor(private repo: EventsRepository) {}

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      if (data.isActive) {
        await this.repo.deactivateAllEvents();
      }
      const event = await this.repo.createEvent({
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        isActive: data.isActive,
        taskType: data.taskType,
        taskConfig: data.taskConfig,
        rewardConfig: data.rewardConfig
      });
      res.status(201).json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const data = req.body;
      if (data.isActive) {
        await this.repo.deactivateAllEvents();
      }
      const event = await this.repo.updateEvent(id, {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined
      });
      res.json({ success: true, data: event });
    } catch (err) {
      next(err);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.repo.deleteEvent(id);
      res.json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  getAllEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await this.repo.getAllEvents();
      res.json({ success: true, data: events });
    } catch (err) {
      next(err);
    }
  };
}
