import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { budgetProposalAPI, departmentsAPI, budgetHeadsAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import './BudgetProposalForm.css';

const BudgetProposalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [departments, setDepartments] = useState([]);
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    financialYear: '2025-2026',
    department: '',
    proposalItems: [{ budgetHead: '', proposedAmount: '', justification: '', previousYearUtilization: '' }],
    notes: ''
  });

  useEffect(() => {
    fetchInitialData();
    if (isEditMode) {
      fetchProposal();
    }
  }, [isEditMode]);

  const fetchInitialData = async () => {
    try {
      const [deptResponse, headResponse] = await Promise.all([
        departmentsAPI.getDepartments(),
        budgetHeadsAPI.getBudgetHeads()
      ]);
      setDepartments(deptResponse.data.data.departments);
      setBudgetHeads(headResponse.data.data.budgetHeads);
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to fetch departments or budget heads');
    }
  };

  const fetchProposal = async () => {
    try {
      setFetching(true);
      const response = await budgetProposalAPI.getBudgetProposalById(id);
      const proposal = response.data.data.proposal;
      
      setFormData({
        financialYear: proposal.financialYear,
        department: proposal.department._id,
        proposalItems: proposal.proposalItems.map(item => ({
          budgetHead: item.budgetHead._id,
          proposedAmount: item.proposedAmount,
          justification: item.justification,
          previousYearUtilization: item.previousYearUtilization || 0
        })),
        notes: proposal.notes || ''
      });
    } catch (err) {
      setError('Failed to fetch proposal');
      console.error('Error fetching proposal:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.proposalItems];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      proposalItems: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      proposalItems: [
        ...prev.proposalItems,
        { budgetHead: '', proposedAmount: '', justification: '', previousYearUtilization: '' }
      ]
    }));
  };

  const removeItem = (index) => {
    if (formData.proposalItems.length > 1) {
      setFormData(prev => ({
        ...prev,
        proposalItems: prev.proposalItems.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.department) {
        setError('Please select a department');
        setLoading(false);
        return;
      }

      if (formData.proposalItems.some(item => !item.budgetHead || !item.proposedAmount || !item.justification)) {
        setError('Please fill in all required fields for each proposal item');
        setLoading(false);
        return;
      }

      const submitData = {
        financialYear: formData.financialYear,
        department: formData.department,
        proposalItems: formData.proposalItems.map(item => ({
          budgetHead: item.budgetHead,
          proposedAmount: parseFloat(item.proposedAmount),
          justification: item.justification,
          previousYearUtilization: parseFloat(item.previousYearUtilization) || 0
        })),
        notes: formData.notes
      };

      if (isEditMode) {
        await budgetProposalAPI.updateBudgetProposal(id, submitData);
        setSuccess('Budget proposal updated successfully');
      } else {
        await budgetProposalAPI.createBudgetProposal(submitData);
        setSuccess('Budget proposal created successfully');
      }

      setTimeout(() => {
        navigate('/budget-proposals');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving budget proposal');
      console.error('Error saving proposal:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTotalProposedAmount = () => {
    return formData.proposalItems.reduce((sum, item) => {
      return sum + (parseFloat(item.proposedAmount) || 0);
    }, 0);
  };

  if (fetching) {
    return (
      <div className="budget-proposal-form-container">
        <div className="loading">Loading budget proposal...</div>
      </div>
    );
  }

  return (
    <div className="budget-proposal-form-container">
      <PageHeader
        title={isEditMode ? 'Edit Budget Proposal' : 'Create Budget Proposal'}
        subtitle="Propose budget requirements for your department"
      >
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => navigate('/budget-proposals')}
        >
          <ArrowLeft size={18} /> Cancel
        </button>
      </PageHeader>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="budget-proposal-form">
        <div className="form-section">
          <h3>Basic Information</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Financial Year <span className="required">*</span></label>
              <input
                type="text"
                name="financialYear"
                value={formData.financialYear}
                onChange={handleInputChange}
                placeholder="e.g., 2025-2026"
                required
              />
            </div>

            <div className="form-group">
              <label>Department <span className="required">*</span></label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                required
                disabled={isEditMode}
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              placeholder="Additional notes for the proposal"
              rows="3"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="section-header">
            <h3>Proposal Items</h3>
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={addItem}
            >
              <Plus size={16} /> Add Item
            </button>
          </div>

          {formData.proposalItems.map((item, index) => (
            <div key={index} className="proposal-item">
              <div className="item-header">
                <h4>Item {index + 1}</h4>
                {formData.proposalItems.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-sm btn-danger"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Budget Head <span className="required">*</span></label>
                  <select
                    value={item.budgetHead}
                    onChange={(e) => handleItemChange(index, 'budgetHead', e.target.value)}
                    required
                  >
                    <option value="">Select Budget Head</option>
                    {budgetHeads.map(head => (
                      <option key={head._id} value={head._id}>
                        {head.name} ({head.category}) - {head.budgetType}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Proposed Amount (₹) <span className="required">*</span></label>
                  <input
                    type="number"
                    value={item.proposedAmount}
                    onChange={(e) => handleItemChange(index, 'proposedAmount', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Previous Year Utilization (₹)</label>
                  <input
                    type="number"
                    value={item.previousYearUtilization}
                    onChange={(e) => handleItemChange(index, 'previousYearUtilization', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Justification <span className="required">*</span></label>
                <textarea
                  value={item.justification}
                  onChange={(e) => handleItemChange(index, 'justification', e.target.value)}
                  placeholder="Explain why this budget is needed"
                  rows="3"
                  required
                />
              </div>
            </div>
          ))}

          <div className="total-proposed">
            <strong>Total Proposed Amount: ₹{getTotalProposedAmount().toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/budget-proposals')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            <Save size={18} /> {loading ? 'Saving...' : isEditMode ? 'Update Proposal' : 'Create Proposal'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetProposalForm;
