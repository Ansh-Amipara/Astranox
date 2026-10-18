import { container } from 'tsyringe';
import { Router } from 'express';
import { AdminController } from './admin.controller';
import { AdminEventsController } from './admin-events.controller';
import { AdminShopController } from './admin-shop.controller';
import { AdminUserController } from './admin-user.controller';
import { AdminDashboardController } from './admin-dashboard.controller';
import { AdminAuditController } from './admin-audit.controller';
import { AdminFlagsController } from './admin-flags.controller';
import { AdminAnnouncementsController } from './admin-announcements.controller';

import { requireAuth, requireAdmin, requireStaff } from '../../core/middleware/require-auth';
import { requireIdempotency } from '../../core/middleware/idempotency';
import { validate } from '../../core/middleware/validate';
import {
  createEventSchema,
  updateEventSchema,
  updateShopItemSchema,
  bulkPriceUpdateSchema,
  resetShopItemSchema,
  banUserSchema,
  unbanUserSchema,
  adminGrantCurrencySchema,
  adminGrantItemSchema,
  updateFeatureFlagSchema,
  createAnnouncementSchema,
} from '@astranox/types';
import { addMoneySchema, addPokemonSchema, editPokemonSchema } from './admin.schema';

const router = Router();

const controller = container.resolve(AdminController);
const eventsController = container.resolve(AdminEventsController);
const shopController = container.resolve(AdminShopController);
const userController = container.resolve(AdminUserController);
const dashboardController = container.resolve(AdminDashboardController);
const auditController = container.resolve(AdminAuditController);
const flagsController = container.resolve(AdminFlagsController);
const announcementsController = container.resolve(AdminAnnouncementsController);

// All admin routes require authenticated session
router.use(requireAuth);

// ==========================================
// Staff Routes (Admin & Moderator Access)
// ==========================================
router.get('/dashboard/stats', requireStaff, dashboardController.getStats);
router.get('/users', requireStaff, userController.getUsers);
router.get('/users/:id', requireStaff, userController.getUserDetail);
router.get('/audit-logs', requireStaff, auditController.getAuditLogs);
router.get('/announcements', requireStaff, announcementsController.getAnnouncements);
router.post(
  '/announcements',
  requireStaff,
  validate(createAnnouncementSchema),
  announcementsController.createAnnouncement
);
router.get('/battles/:id', requireStaff, controller.getBattleById);
router.delete('/announcements/:id', requireStaff, announcementsController.deleteAnnouncement);

// ==========================================
// Admin-Only Routes
// ==========================================

// Economy & Reports
router.get('/economy', requireAdmin, dashboardController.getEconomy);

// Pokémart Shop Management
router.get('/shop/items', requireAdmin, shopController.getItems);
router.patch('/shop/items/:key', requireAdmin, validate(updateShopItemSchema), shopController.updateItem);
router.post('/shop/items/bulk-price', requireAdmin, validate(bulkPriceUpdateSchema), shopController.bulkPrice);
router.get('/shop/items/:key/history', requireAdmin, shopController.getHistory);
router.post('/shop/items/:key/reset', requireAdmin, validate(resetShopItemSchema), shopController.resetItem);

// User Moderation & Mutations
router.post('/users/:id/ban', requireAdmin, validate(banUserSchema), userController.banUser);
router.post('/users/:id/unban', requireAdmin, validate(unbanUserSchema), userController.unbanUser);
router.post(
  '/users/:id/currency',
  requireAdmin,
  requireIdempotency(),
  validate(adminGrantCurrencySchema),
  userController.grantCurrency
);
router.post(
  '/users/:id/items',
  requireAdmin,
  requireIdempotency(),
  validate(adminGrantItemSchema),
  userController.grantItem
);

// Feature Flags
router.get('/flags', requireAdmin, flagsController.getFlags);
router.patch('/flags/:key', requireAdmin, validate(updateFeatureFlagSchema), flagsController.updateFlag);

// Cache Management
router.post('/cache/clear', requireAdmin, controller.clearCache);

// Events Management
router.get('/events', requireAdmin, eventsController.getAllEvents);
router.post('/events', requireAdmin, validate(createEventSchema), eventsController.createEvent);
router.put('/events/:id', requireAdmin, validate(updateEventSchema), eventsController.updateEvent);
router.delete('/events/:id', requireAdmin, eventsController.deleteEvent);

// Legacy Species & Pokémon Grant Endpoints
router.get('/species', requireAdmin, controller.getAllSpecies);
router.get('/users/:id/pokemon', requireAdmin, controller.getUserPokemon);
router.post('/users/:id/money', requireAdmin, validate(addMoneySchema), controller.addMoney);
router.post('/users/:id/pokemon', requireAdmin, validate(addPokemonSchema), controller.addPokemon);
router.put('/users/:id/pokemon/:pokemonId', requireAdmin, validate(editPokemonSchema), controller.editPokemon);

export { router as adminRoutes };
