import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import notificationService from '../services/notificationService';

const router = Router();

router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const count = await notificationService.getUnreadCount(userId);
    res.json({ success: true, count });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor' });
  }
});

router.get('/', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = Number(req.query.limit || 50);
    const offset = Number(req.query.offset || 0);

    const { notifications, total } = await notificationService.getUserNotifications(userId, {
      unreadOnly,
      limit,
      offset,
    });

    res.json({ success: true, notifications, total });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor' });
  }
});

router.post('/mark-all-read', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const updated = await notificationService.markAllAsRead(userId);
    res.json({ success: true, updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor' });
  }
});

router.post('/:id/read', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    await notificationService.markAsRead(req.params.id as string, userId);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor' });
  }
});

router.get('/preferences', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const preferences = await notificationService.getUserPreferences(userId);
    res.json({ success: true, data: preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor' });
  }
});

router.put('/preferences', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const { emailEnabled, pushEnabled, typePreferences } = req.body || {};

    const updates: {
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      typePreferences?: Record<string, boolean>;
    } = {};

    if (typeof emailEnabled === 'boolean') updates.emailEnabled = emailEnabled;
    if (typeof pushEnabled === 'boolean') updates.pushEnabled = pushEnabled;
    if (typePreferences && typeof typePreferences === 'object') updates.typePreferences = typePreferences;

    const preferences = await notificationService.updatePreferences(userId, updates);
    res.json({ success: true, data: preferences });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error?.message || 'Error interno del servidor' });
  }
});

export default router;
