const express = require('express');
const router = express.Router();
const {
  getBudgetProposals,
  getBudgetProposalById,
  createBudgetProposal,
  updateBudgetProposal,
  submitBudgetProposal,
  approveBudgetProposal,
  rejectBudgetProposal,
  getBudgetProposalsStats
} = require('../controllers/budgetProposalController');
const { verifyToken, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(verifyToken);

// Get stats (accessible to authorized roles)
router.get('/stats', authorize('admin', 'principal', 'vice_principal', 'office', 'hod', 'department_staff', 'department'), getBudgetProposalsStats);

// Get all proposals (accessible to authorized roles)
router.get('/', authorize('admin', 'principal', 'vice_principal', 'office', 'hod', 'department_staff', 'department'), getBudgetProposals);

// Get proposal by ID
router.get('/:id', getBudgetProposalById);

// Create new proposal (department HOD/staff)
router.post('/', authorize('hod', 'department_staff'), createBudgetProposal);

// Update proposal (only draft/revised proposals by creator)
router.put('/:id', authorize('hod', 'department_staff'), updateBudgetProposal);

// Submit proposal (only draft/revised proposals by creator)
router.put('/:id/submit', authorize('hod', 'department_staff'), submitBudgetProposal);

// Approve proposal (admin/principal/vice principal)
router.put('/:id/approve', authorize('admin', 'principal', 'vice_principal'), approveBudgetProposal);

// Reject proposal (admin/principal/vice principal)
router.put('/:id/reject', authorize('admin', 'principal', 'vice_principal'), rejectBudgetProposal);

module.exports = router;
