// Audit log admin endpoint placeholder
// TODO: Implement endpoints for viewing audit logs

import express from 'express';
const router = express.Router();

// GET /admin/audit - list all audit logs
router.get('/', (req, res) => {
  // TODO: Fetch audit logs from database
  res.json([]);
});

export default router;
