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
import { AdminBalanceController } from '../balance/admin-balance.controller';
import { AdminArenaController } from './admin-arena.controller';
import { AdminDungeonController } from './admin-dungeon.controller';

import { requireAuth, requireAdmin, requireStaff } from '../../core/middleware/require-auth';
import { requireIdempotency } from '../../core/middleware/idempotency';
import { validate } from '../../core/middleware/validate';
import {
  createEventSchema,
  updateEventSchema,
  archiveEventSchema,
  createShopItemSchema,
  updateShopItemSchema,
  archiveShopItemSchema,
  bulkPriceUpdateSchema,
  resetShopItemSchema,
  createArenaTrainerSchema,
  updateArenaTrainerSchema,
  archiveArenaTrainerSchema,
  updateRankDefinitionSchema,
  createDungeonFloorRuleSchema,
  updateDungeonFloorRuleSchema,
  archiveDungeonFloorRuleSchema,
  banUserSchema,
  unbanUserSchema,
  adminGrantCurrencySchema,
  adminGrantItemSchema,
  updateFeatureFlagSchema,
  createAnnouncementSchema,
  balanceSectionParamSchema,
  balanceDraftInputSchema,
  balancePublishInputSchema,
  balanceRollbackInputSchema,
  balanceResetInputSchema,
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
const balanceController = container.resolve(AdminBalanceController);
const arenaController = container.resolve(AdminArenaController);
const dungeonController = container.resolve(AdminDungeonController);

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
router.get('/exploration', requireStaff, controller.getExplorationOverview);
router.delete('/announcements/:id', requireStaff, announcementsController.deleteAnnouncement);

// ==========================================
// Admin-Only Routes
// ==========================================

// Economy & Reports
router.get('/economy', requireAdmin, dashboardController.getEconomy);

// Pokémart Shop Management
router.get('/shop/items', requireAdmin, shopController.getItems);
router.post(
  '/shop/items',
  requireAdmin,
  requireIdempotency(),
  validate(createShopItemSchema),
  shopController.createItem
);
router.patch('/shop/items/:key', requireAdmin, validate(updateShopItemSchema), shopController.updateItem);
router.delete(
  '/shop/items/:key',
  requireAdmin,
  validate(archiveShopItemSchema),
  shopController.archiveItem
);
router.post(
  '/shop/items/:key/restore',
  requireAdmin,
  validate(archiveShopItemSchema),
  shopController.unarchiveItem
);
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

// Balance Overrides & Management
router.get('/balance', requireAdmin, balanceController.getAllSections);
router.get(
  '/balance/:section',
  requireAdmin,
  validate({ params: balanceSectionParamSchema }),
  balanceController.getSection
);
router.put(
  '/balance/:section/draft',
  requireAdmin,
  validate({ params: balanceSectionParamSchema, body: balanceDraftInputSchema }),
  balanceController.saveDraft
);
router.post(
  '/balance/:section/preview',
  requireAdmin,
  validate({ params: balanceSectionParamSchema }),
  balanceController.previewDraft
);
router.post(
  '/balance/:section/publish',
  requireAdmin,
  validate({ params: balanceSectionParamSchema, body: balancePublishInputSchema }),
  balanceController.publishDraft
);
router.post(
  '/balance/:section/rollback',
  requireAdmin,
  validate({ params: balanceSectionParamSchema, body: balanceRollbackInputSchema }),
  balanceController.rollback
);
router.post(
  '/balance/:section/reset',
  requireAdmin,
  validate({ params: balanceSectionParamSchema, body: balanceResetInputSchema }),
  balanceController.resetToDefaults
);
router.get(
  '/balance/:section/history',
  requireAdmin,
  validate({ params: balanceSectionParamSchema }),
  balanceController.getHistory
);

// Cache Management
router.post('/cache/clear', requireAdmin, controller.clearCache);

// Arena Trainers Management
router.get('/arena/trainers', requireAdmin, arenaController.getTrainers);
router.post(
  '/arena/trainers',
  requireAdmin,
  requireIdempotency(),
  validate(createArenaTrainerSchema),
  arenaController.createTrainer
);
router.patch(
  '/arena/trainers/:key',
  requireAdmin,
  validate(updateArenaTrainerSchema),
  arenaController.updateTrainer
);
router.delete(
  '/arena/trainers/:key',
  requireAdmin,
  validate(archiveArenaTrainerSchema),
  arenaController.archiveTrainer
);
router.post(
  '/arena/trainers/:key/restore',
  requireAdmin,
  validate(archiveArenaTrainerSchema),
  arenaController.unarchiveTrainer
);

// Rank Definitions & Examiners Management
router.get('/arena/ranks', requireAdmin, arenaController.getRanks);
router.patch(
  '/arena/ranks/:rank',
  requireAdmin,
  validate(updateRankDefinitionSchema),
  arenaController.updateRank
);

// Dungeon Floors Management (Infinity Tower & Void Rifts)
router.get('/dungeons/floors', requireAdmin, dungeonController.getFloors);
router.post(
  '/dungeons/floors',
  requireAdmin,
  requireIdempotency(),
  validate(createDungeonFloorRuleSchema),
  dungeonController.createFloor
);
router.patch(
  '/dungeons/floors/:id',
  requireAdmin,
  validate(updateDungeonFloorRuleSchema),
  dungeonController.updateFloor
);
router.delete(
  '/dungeons/floors/:id',
  requireAdmin,
  validate(archiveDungeonFloorRuleSchema),
  dungeonController.archiveFloor
);
router.post(
  '/dungeons/floors/:id/restore',
  requireAdmin,
  validate(archiveDungeonFloorRuleSchema),
  dungeonController.unarchiveFloor
);

// Events Management
router.get('/events', requireAdmin, eventsController.getAllEvents);
router.post(
  '/events',
  requireAdmin,
  requireIdempotency(),
  validate(createEventSchema),
  eventsController.createEvent
);
router.patch(
  '/events/:id',
  requireAdmin,
  validate(updateEventSchema),
  eventsController.updateEvent
);
router.delete(
  '/events/:id',
  requireAdmin,
  validate(archiveEventSchema),
  eventsController.archiveEvent
);
router.post(
  '/events/:id/restore',
  requireAdmin,
  validate(archiveEventSchema),
  eventsController.unarchiveEvent
);

// Species & Items Roster Endpoints
router.get('/species', requireStaff, controller.getAllSpecies);
router.get('/items', requireStaff, controller.getAllItems);
router.get('/users/:id/pokemon', requireAdmin, controller.getUserPokemon);
router.post('/users/:id/money', requireAdmin, validate(addMoneySchema), controller.addMoney);
router.post('/users/:id/pokemon', requireAdmin, validate(addPokemonSchema), controller.addPokemon);
router.put('/users/:id/pokemon/:pokemonId', requireAdmin, validate(editPokemonSchema), controller.editPokemon);

export { router as adminRoutes };
