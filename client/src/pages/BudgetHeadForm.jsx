import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { budgetHeadsAPI, categoriesAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import { IndianRupee, Tag, AlertCircle, Save, X, AlignLeft, Hash, ArrowLeft } from 'lucide-react';
import './BudgetHeadForm.css';

const BudgetHeadForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        category: 'other',
        isActive: true
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
        if (isEditMode) {
            fetchBudgetHead();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getCategories();
            if (response.data.success) {
                setCategories(response.data.data.categories);
            }
        } catch (err) {
            console.error('Failed to fetch categories:', err);
        }
    };

    const fetchBudgetHead = async () => {
        try {
            setLoading(true);
            const response = await budgetHeadsAPI.getBudgetHeadById(id);
            if (response.data.success) {
                const head = response.data.data.budgetHead;
                setFormData({
                    name: head.name,
                    code: head.code,
                    description: head.description || '',
                    category: head.category,
                    isActive: head.isActive
                });
            }
        } catch (err) {
            setError('Failed to fetch budget head details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                await budgetHeadsAPI.updateBudgetHead(id, formData);
            } else {
                await budgetHeadsAPI.createBudgetHead(formData);
            }
            navigate('/budget-heads');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save budget head');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="form-page-container">
                <div className="loading">Loading budget head data...</div>
            </div>
        );
    }

    return (
        <div className="form-page-container">
            <PageHeader
                title={isEditMode ? "Edit Budget Head" : "Add New Budget Head"}
                subtitle={isEditMode ? `Updating ${formData.name}` : "Create a new category for financial allocations"}
            >
                <button className="btn btn-secondary" onClick={() => navigate('/budget-heads')}>
                    <ArrowLeft size={18} /> Back to Budget Heads
                </button>
            </PageHeader>

            <div className="form-content-card">
                {error && (
                    <div className="form-error-banner">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="modern-form">
                    <div className="form-section">
                        <h3 className="section-title">
                            <IndianRupee size={18} />
                            Budget Head Details
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Budget Head Name *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon-wrapper"><Tag size={16} /></span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="form-input has-icon"
                                        placeholder="e.g., Academic Publications"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Budget Head Code *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon-wrapper"><Hash size={16} /></span>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        className="form-input has-icon"
                                        placeholder="e.g., AD-PUB"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category *</label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Description</label>
                                <div className="input-with-icon textarea-wrapper">
                                    <span className="input-icon-wrapper"><AlignLeft size={16} /></span>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        className="form-input has-icon"
                                        placeholder="Explain the purpose of this budget head..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">
                            Status & Visibility
                        </h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <div className="checkbox-item active-toggle">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                    />
                                    <label htmlFor="isActive">
                                        {formData.isActive ? 'Active - Available for allocations' : 'Inactive - Hidden from new budget plans'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/budget-heads')}
                            disabled={saving}
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Save size={18} /> {saving ? 'Saving...' : (isEditMode ? 'Update Budget Head' : 'Create Budget Head')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BudgetHeadForm;
