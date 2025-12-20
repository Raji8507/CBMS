import React, { useState, useEffect } from 'react';
import { budgetHeadsAPI, categoriesAPI } from '../services/api';
import { Link } from 'react-router-dom';
import Tooltip from '../components/Tooltip/Tooltip';
import PageHeader from '../components/Common/PageHeader';
import StatCard from '../components/Common/StatCard';
import { Plus, Pencil, Trash2, IndianRupee } from 'lucide-react';
import './BudgetHeads.css';

const BudgetHeads = () => {
  const [budgetHeads, setBudgetHeads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    isActive: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchBudgetHeads();
    fetchStats();
  }, [filters]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getCategories();
      if (response.data.success) {
        setCategories(response.data.data.categories);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchBudgetHeads = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.isActive) params.isActive = filters.isActive;

      const response = await budgetHeadsAPI.getBudgetHeads(params);
      setBudgetHeads(response.data.data.budgetHeads);
      setError(null);
    } catch (err) {
      setError('Failed to fetch budget heads');
      console.error('Error fetching budget heads:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await budgetHeadsAPI.getBudgetHeadStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget head?')) {
      try {
        await budgetHeadsAPI.deleteBudgetHead(id);
        fetchBudgetHeads();
        fetchStats();
      } catch (err) {
        setError('Failed to delete budget head');
        console.error('Error deleting budget head:', err);
      }
    }
  };

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.color || '#6c757d';
  };

  if (loading) {
    return (
      <div className="budget-heads-container">
        <div className="loading">Loading budget heads...</div>
      </div>
    );
  }

  return (
    <div className="budget-heads-container">
      <PageHeader
        title="Budget Heads Management"
        subtitle="Manage and allocate budget categories"
      >
        <Link to="/budget-heads/add" className="btn btn-primary">
          <Plus size={18} /> Add Budget Head
        </Link>
      </PageHeader>

      {error && <div className="error-message">{error}</div>}

      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Total Budget Heads"
            value={stats.totalBudgetHeads}
            icon={<IndianRupee size={24} />}
            color="var(--primary)"
          />
          <StatCard
            title="Active Budget Heads"
            value={stats.activeBudgetHeads}
            icon={<IndianRupee size={24} />}
            color="var(--success)"
          />
          <StatCard
            title="Inactive Budget Heads"
            value={stats.inactiveBudgetHeads}
            icon={<IndianRupee size={24} />}
            color="var(--warning)"
          />
          <StatCard
            title="Categories"
            value={stats.byCategory ? Object.keys(stats.byCategory).length : 0}
            icon={<IndianRupee size={24} />}
            color="var(--info)"
          />
        </div>
      )}

      <div className="filters-section">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Search budget heads..."
            name="search"
            value={filters.search}
            onChange={handleFilterChange}
            className="filter-input"
          />
        </div>
        <div className="filter-group">
          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select
            name="isActive"
            value={filters.isActive}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
      </div>

      <div className="budget-heads-grid">
        {budgetHeads.map((head) => (
          <div key={head._id} className="budget-head-card">
            <div className="card-header">
              <div className="head-info">
                <h3 className="head-name">{head.name}</h3>
                <span className="head-code">{head.code}</span>
              </div>
              <div className="head-status">
                <span className={`status ${head.isActive ? 'active' : 'inactive'}`}>
                  {head.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
            </div>

            <div className="card-body">
              <div className="head-category">
                <span
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(head.category) }}
                >
                  {head.category.toUpperCase()}
                </span>
              </div>

              <p className="head-description">
                {head.description || 'No description provided'}
              </p>

              <div className="head-meta">
                <p className="created-date">
                  Created: {new Date(head.createdAt).toLocaleDateString()}
                </p>
                <p className="head-id">ID: {head._id}</p>
              </div>
            </div>

            <div className="card-actions">
              <Tooltip text="Edit Budget Head" position="top">
                <Link
                  to={`/budget-heads/edit/${head._id}`}
                  className="btn btn-sm btn-secondary"
                >
                  <Pencil size={16} /> Edit
                </Link>
              </Tooltip>
              <Tooltip text="Delete Budget Head" position="top">
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(head._id)}
                >
                  <Trash2 size={16} /> Delete
                </button>
              </Tooltip>
            </div>
          </div>
        ))}
      </div>

      {budgetHeads.length === 0 && (
        <div className="no-budget-heads">
          <div className="no-budget-heads-icon">
            <IndianRupee size={48} />
          </div>
          <h3>No Budget Heads Found</h3>
          <p>No budget heads found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default BudgetHeads;
