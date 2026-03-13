import { Router } from 'express';
import { EmailTestController } from '../controllers/emailTest.controller';

const router = Router();
// Test bulk PO emails
router.post('/bulk-po', EmailTestController.testBulkPOEmails);

// Test email configuration
router.get('/status', EmailTestController.testEmailStatus);

// Test single PO email
router.post('/po', EmailTestController.testPOEmail);

// Test single reorder alert
router.post('/reorder-alert', EmailTestController.testReorderAlert);


// Test bulk reorder alerts
router.post('/bulk-alerts', EmailTestController.testBulkReorderAlerts);

export default router;