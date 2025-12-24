import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { budgetProposalAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import StatCard from '../components/Common/StatCard';
import Tooltip from '../components/Tooltip/Tooltip';
import { Plus, Eye, Pencil, CheckCircle, XCircle, Clock, DollarSign } from 'lucide-react';
import './BudgetProposals.css';

const BudgetProposals = () => {
  const [proposals, setProposals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    financialYear: '2025-2026'
  });

  const fetchProposals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await budgetProposalAPI.getBudgetProposals(filters);
      setProposals(response.data.data.proposals);
      setError(null);
    } catch (err) {
      setError('Failed to fetch budget proposals');
      console.error('Error fetching proposals:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const fetchStats = useCallback(async () => {
    try {
      const response = await budgetProposalAPI.getBudgetProposalsStats({ financialYear: filters.financialYear });
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [filters.financialYear]);

  useEffect(() => {
    fetchProposals();
    fetchStats();
  }, [fetchProposals, fetchStats]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: '#ffc107',
      submitted: '#17a2b8',
      approved: '#28a745',
      rejected: '#dc3545',
      revised: '#fd7e14'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle size={18} style={{ color: '#28a745' }} />;
      case 'rejected':
        return <XCircle size={18} style={{ color: '#dc3545' }} />;
      case 'submitted':
        return <Clock size={18} style={{ color: '#17a2b8' }} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="budget-proposals-container">
        <div className="loading">Loading budget proposals...</div>
      </div>
    );
  }

  return (
    <div className="budget-proposals-container">
      <PageHeader
        title="Budget Proposals Management"
        subtitle="Create and manage budget proposals for your department"
      >
        <Link to="/budget-proposals/add" className="btn btn-primary">
          <Plus size={18} /> Create Proposal
        </Link>
      </PageHeader>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Total Proposals"
            value={stats.totalProposals}
            icon={<DollarSign size={24} />}
            color="var(--primary)"
          />
          <StatCard
            title="Submitted"
            value={stats.submittedProposals}
            icon={<Clock size={24} />}
            color="var(--info)"
          />
          <StatCard
            title="Approved"
            value={stats.approvedProposals}
            icon={<CheckCircle size={24} />}
            color="var(--success)"
          />
          <StatCard
            title="Rejected"
            value={stats.rejectedProposals}
            icon={<XCircle size={24} />}
            color="var(--danger)"
          />
          <StatCard
            title="Approved Amount"
            value={`₹${stats.totalApprovedAmount.toLocaleString('en-IN')}`}
            icon={<DollarSign size={24} />}
            color="var(--success)"
          />
        </div>
      )}

      <div className="filters-section">
        <div className="form-group">
          <label>Financial Year</label>
          <input
            type="text"
            name="financialYear"
            value={filters.financialYear}
            onChange={handleFilterChange}
            placeholder="e.g., 2025-2026"
          />
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="revised">Revised</option>
          </select>
        </div>

        <div className="form-group">
          <label>Search</label>
          <input
            type="text"
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            placeholder="Search by department name..."
          />
        </div>
      </div>

      <div className="proposals-table-container">
        {proposals.length === 0 ? (
          <div className="empty-state">
            <p>No budget proposals found</p>
            <Link to="/budget-proposals/add" className="btn btn-primary btn-sm">
              Create First Proposal
            </Link>
          </div>
        ) : (
          <table className="proposals-table">
            <thead>
              <tr>
                <th>Department</th>
                <th>Financial Year</th>
                <th>Total Proposed</th>
                <th>Items</th>
                <th>Status</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {proposals.map((proposal) => (
                <tr key={proposal._id}>
                  <td>
                    <div className="dept-info">
                      <div className="dept-name">{proposal.department.name}</div>
                      <div className="dept-code">{proposal.department.code}</div>
                    </div>
                  </td>
                  <td>{proposal.financialYear}</td>
                  <td>
                    <span className="amount">
                      ₹{proposal.totalProposedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td>
                    <span className="item-count">{proposal.proposalItems.length} items</span>
                  </td>
                  <td>
                    <div className="status-cell">
                      {getStatusIcon(proposal.status)}
                      <span className="status" style={{ backgroundColor: getStatusColor(proposal.status) }}>
                        {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                      </span>
                    </div>
                  </td>
                  <td>
                    {proposal.submittedDate ? new Date(proposal.submittedDate).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <Tooltip text="View Proposal" position="top">
                        <Link
                          to={`/budget-proposals/${proposal._id}`}
                          className="btn btn-sm btn-info"
                        >
                          <Eye size={16} />
                        </Link>
                      </Tooltip>
                      {(proposal.status === 'draft' || proposal.status === 'revised') && (
                        <Tooltip text="Edit Proposal" position="top">
                          <Link
                            to={`/budget-proposals/edit/${proposal._id}`}
                            className="btn btn-sm btn-secondary"
                          >
                            <Pencil size={16} />
                          </Link>
                        </Tooltip>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default BudgetProposals;
