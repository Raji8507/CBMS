const BudgetProposal = require('../models/BudgetProposal');
const Department = require('../models/Department');
const BudgetHead = require('../models/BudgetHead');
const Allocation = require('../models/Allocation');
const AuditLog = require('../models/AuditLog');

// @desc    Get all budget proposals
// @route   GET /api/budget-proposals
// @access  Private
const getBudgetProposals = async (req, res) => {
  try {
    const { financialYear, department, status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (financialYear) query.financialYear = financialYear;
    if (department) query.department = department;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    
    const [proposals, total] = await Promise.all([
      BudgetProposal.find(query)
        .populate('department', 'name code')
        .populate('proposalItems.budgetHead', 'name category budgetType')
        .populate('submittedBy', 'name email')
        .populate('approvedBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      BudgetProposal.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: {
        proposals,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching budget proposals',
      error: error.message
    });
  }
};

// @desc    Get budget proposal by ID
// @route   GET /api/budget-proposals/:id
// @access  Private
const getBudgetProposalById = async (req, res) => {
  try {
    const proposal = await BudgetProposal.findById(req.params.id)
      .populate('department', 'name code')
      .populate('proposalItems.budgetHead', 'name category budgetType')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Budget proposal not found'
      });
    }

    res.status(200).json({
      success: true,
      data: { proposal }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching budget proposal',
      error: error.message
    });
  }
};

// @desc    Create budget proposal
// @route   POST /api/budget-proposals
// @access  Private
const createBudgetProposal = async (req, res) => {
  try {
    const { financialYear, department, proposalItems, notes } = req.body;

    // Validate department exists
    const departmentExists = await Department.findById(department);
    if (!departmentExists) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Validate budget heads exist
    const budgetHeadIds = proposalItems.map(item => item.budgetHead);
    const budgetHeads = await BudgetHead.find({ _id: { $in: budgetHeadIds } });
    if (budgetHeads.length !== budgetHeadIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more budget heads are invalid'
      });
    }

    // Check if proposal already exists for this FY and department
    const existingProposal = await BudgetProposal.findOne({
      financialYear,
      department,
      status: { $in: ['draft', 'submitted'] }
    });

    if (existingProposal) {
      return res.status(400).json({
        success: false,
        message: 'Budget proposal already exists for this financial year and department'
      });
    }

    const proposal = await BudgetProposal.create({
      financialYear,
      department,
      proposalItems,
      notes,
      submittedBy: req.user._id
    });

    // Populate the created proposal
    const populatedProposal = await BudgetProposal.findById(proposal._id)
      .populate('department', 'name code')
      .populate('proposalItems.budgetHead', 'name category budgetType')
      .populate('submittedBy', 'name email');

    // Log audit
    await AuditLog.create({
      action: 'CREATE_BUDGET_PROPOSAL',
      entity: 'BudgetProposal',
      entityId: proposal._id,
      performedBy: req.user._id,
      changes: {
        created: populatedProposal
      }
    });

    res.status(201).json({
      success: true,
      data: { proposal: populatedProposal },
      message: 'Budget proposal created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating budget proposal',
      error: error.message
    });
  }
};

// @desc    Update budget proposal
// @route   PUT /api/budget-proposals/:id
// @access  Private
const updateBudgetProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { proposalItems, notes } = req.body;

    const proposal = await BudgetProposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Budget proposal not found'
      });
    }

    // Can only edit draft proposals
    if (proposal.status !== 'draft' && proposal.status !== 'revised') {
      return res.status(400).json({
        success: false,
        message: 'Can only edit draft or revised proposals'
      });
    }

    // Validate budget heads if updating items
    if (proposalItems) {
      const budgetHeadIds = proposalItems.map(item => item.budgetHead);
      const budgetHeads = await BudgetHead.find({ _id: { $in: budgetHeadIds } });
      if (budgetHeads.length !== budgetHeadIds.length) {
        return res.status(400).json({
          success: false,
          message: 'One or more budget heads are invalid'
        });
      }
    }

    const oldData = { ...proposal.toObject() };

    // Update fields
    if (proposalItems) proposal.proposalItems = proposalItems;
    if (notes !== undefined) proposal.notes = notes;
    proposal.lastModifiedBy = req.user._id;

    await proposal.save();

    const updatedProposal = await BudgetProposal.findById(id)
      .populate('department', 'name code')
      .populate('proposalItems.budgetHead', 'name category budgetType')
      .populate('submittedBy', 'name email');

    // Log audit
    await AuditLog.create({
      action: 'UPDATE_BUDGET_PROPOSAL',
      entity: 'BudgetProposal',
      entityId: id,
      performedBy: req.user._id,
      changes: {
        before: oldData,
        after: updatedProposal.toObject()
      }
    });

    res.status(200).json({
      success: true,
      data: { proposal: updatedProposal },
      message: 'Budget proposal updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating budget proposal',
      error: error.message
    });
  }
};

// @desc    Submit budget proposal
// @route   PUT /api/budget-proposals/:id/submit
// @access  Private
const submitBudgetProposal = async (req, res) => {
  try {
    const { id } = req.params;

    const proposal = await BudgetProposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Budget proposal not found'
      });
    }

    if (proposal.status !== 'draft' && proposal.status !== 'revised') {
      return res.status(400).json({
        success: false,
        message: 'Only draft or revised proposals can be submitted'
      });
    }

    if (!proposal.proposalItems || proposal.proposalItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Proposal must have at least one item'
      });
    }

    proposal.status = 'submitted';
    proposal.submittedDate = new Date();
    proposal.lastModifiedBy = req.user._id;
    await proposal.save();

    const updatedProposal = await BudgetProposal.findById(id)
      .populate('department', 'name code')
      .populate('proposalItems.budgetHead', 'name category budgetType')
      .populate('submittedBy', 'name email');

    // Log audit
    await AuditLog.create({
      action: 'SUBMIT_BUDGET_PROPOSAL',
      entity: 'BudgetProposal',
      entityId: id,
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      data: { proposal: updatedProposal },
      message: 'Budget proposal submitted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error submitting budget proposal',
      error: error.message
    });
  }
};

// @desc    Approve budget proposal
// @route   PUT /api/budget-proposals/:id/approve
// @access  Private (Admin/Principal/Vice Principal)
const approveBudgetProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const proposal = await BudgetProposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Budget proposal not found'
      });
    }

    if (proposal.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted proposals can be approved'
      });
    }

    proposal.status = 'approved';
    proposal.approvedDate = new Date();
    proposal.approvedBy = req.user._id;
    if (notes) proposal.notes = notes;
    proposal.lastModifiedBy = req.user._id;
    await proposal.save();

    const updatedProposal = await BudgetProposal.findById(id)
      .populate('department', 'name code')
      .populate('proposalItems.budgetHead', 'name category budgetType')
      .populate('submittedBy', 'name email')
      .populate('approvedBy', 'name email');

    // Log audit
    await AuditLog.create({
      action: 'APPROVE_BUDGET_PROPOSAL',
      entity: 'BudgetProposal',
      entityId: id,
      performedBy: req.user._id
    });

    res.status(200).json({
      success: true,
      data: { proposal: updatedProposal },
      message: 'Budget proposal approved successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error approving budget proposal',
      error: error.message
    });
  }
};

// @desc    Reject budget proposal
// @route   PUT /api/budget-proposals/:id/reject
// @access  Private (Admin/Principal/Vice Principal)
const rejectBudgetProposal = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    if (!rejectionReason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      });
    }

    const proposal = await BudgetProposal.findById(id);
    if (!proposal) {
      return res.status(404).json({
        success: false,
        message: 'Budget proposal not found'
      });
    }

    if (proposal.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted proposals can be rejected'
      });
    }

    proposal.status = 'rejected';
    proposal.rejectionReason = rejectionReason;
    proposal.lastModifiedBy = req.user._id;
    await proposal.save();

    const updatedProposal = await BudgetProposal.findById(id)
      .populate('department', 'name code')
      .populate('proposalItems.budgetHead', 'name category budgetType')
      .populate('submittedBy', 'name email');

    // Log audit
    await AuditLog.create({
      action: 'REJECT_BUDGET_PROPOSAL',
      entity: 'BudgetProposal',
      entityId: id,
      performedBy: req.user._id,
      changes: { rejectionReason }
    });

    res.status(200).json({
      success: true,
      data: { proposal: updatedProposal },
      message: 'Budget proposal rejected'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error rejecting budget proposal',
      error: error.message
    });
  }
};

// @desc    Get budget proposals stats
// @route   GET /api/budget-proposals/stats
// @access  Private
const getBudgetProposalsStats = async (req, res) => {
  try {
    const { financialYear } = req.query;

    const query = {};
    if (financialYear) query.financialYear = financialYear;

    const [
      totalProposals,
      submittedProposals,
      approvedProposals,
      rejectedProposals,
      draftProposals,
      totalProposedAmount
    ] = await Promise.all([
      BudgetProposal.countDocuments(query),
      BudgetProposal.countDocuments({ ...query, status: 'submitted' }),
      BudgetProposal.countDocuments({ ...query, status: 'approved' }),
      BudgetProposal.countDocuments({ ...query, status: 'rejected' }),
      BudgetProposal.countDocuments({ ...query, status: 'draft' }),
      BudgetProposal.aggregate([
        { $match: { ...query, status: 'approved' } },
        { $group: { _id: null, total: { $sum: '$totalProposedAmount' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalProposals,
        submittedProposals,
        approvedProposals,
        rejectedProposals,
        draftProposals,
        totalApprovedAmount: totalProposedAmount[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching budget proposals stats',
      error: error.message
    });
  }
};

module.exports = {
  getBudgetProposals,
  getBudgetProposalById,
  createBudgetProposal,
  updateBudgetProposal,
  submitBudgetProposal,
  approveBudgetProposal,
  rejectBudgetProposal,
  getBudgetProposalsStats
};
