import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { categoriesAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import { Layers, Tag, AlertCircle, Save, X, ArrowLeft, Palette, AlignLeft, Hash } from 'lucide-react';
import './CategoryForm.css';

const CategoryForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        color: '#1a237e',
        description: '',
        isActive: true
    });

    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    const presetColors = [
        '#1a237e', '#28a745', '#007bff', '#17a2b8',
        '#ffc107', '#6f42c1', '#fd7e14', '#6c757d',
        '#c62828', '#2e7d32', '#0277bd', '#f57c00'
    ];

    useEffect(() => {
        if (isEditMode) {
            fetchCategory();
        }
    }, [id]);

    const fetchCategory = async () => {
        try {
            setLoading(true);
            const response = await categoriesAPI.getCategoryById(id);
            if (response.data.success) {
                const category = response.data.data.category;
                setFormData({
                    name: category.name,
                    code: category.code,
                    color: category.color || '#1a237e',
                    description: category.description || '',
                    isActive: category.isActive
                });
            }
        } catch (err) {
            setError('Failed to fetch category details');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'name' && !isEditMode) {
            // Auto-generate code from name
            const autoCode = value.trim().substring(0, 5).toUpperCase().replace(/\s+/g, '');
            setFormData(prev => ({
                ...prev,
                name: value,
                code: autoCode
            }));
            return;
        }

        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleColorSelect = (color) => {
        setFormData(prev => ({ ...prev, color }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            if (isEditMode) {
                await categoriesAPI.updateCategory(id, formData);
            } else {
                await categoriesAPI.createCategory(formData);
            }
            navigate('/categories');
        } catch (err) {
            setError('Failed to save category');
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="form-page-container">
                <div className="loading">Loading category data...</div>
            </div>
        );
    }

    return (
        <div className="form-page-container">
            <PageHeader
                title={isEditMode ? "Edit Category" : "Add New Category"}
                subtitle={isEditMode ? `Updating ${formData.name}` : "Create a new organization category for budget heads"}
            >
                <button className="btn btn-secondary" onClick={() => navigate('/categories')}>
                    <ArrowLeft size={18} /> Back to Categories
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
                            <Layers size={18} />
                            Category Identity
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Category Name *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon-wrapper"><Tag size={16} /></span>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="form-input has-icon"
                                        placeholder="e.g., Research & Development"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Category Code *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon-wrapper"><Hash size={16} /></span>
                                    <input
                                        type="text"
                                        name="code"
                                        value={formData.code}
                                        onChange={handleChange}
                                        required
                                        className="form-input has-icon"
                                        placeholder="e.g., R-D"
                                        style={{ textTransform: 'uppercase' }}
                                    />
                                </div>
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
                                        placeholder="Explain what this category covers..."
                                        rows="3"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">
                            <Palette size={18} />
                            Visual Styling
                        </h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Accent Color</label>
                                <div className="color-picker-container">
                                    <div
                                        className="color-preview-large"
                                        style={{ backgroundColor: formData.color }}
                                    >
                                        <div className="preview-label">Sample Badge</div>
                                    </div>
                                    <div className="preset-colors-grid">
                                        {presetColors.map(color => (
                                            <button
                                                key={color}
                                                type="button"
                                                className={`color-preset-btn ${formData.color === color ? 'selected' : ''}`}
                                                style={{ backgroundColor: color }}
                                                onClick={() => handleColorSelect(color)}
                                                title={color}
                                            />
                                        ))}
                                    </div>
                                    <input
                                        type="color"
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        className="custom-color-input"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">
                            Management
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
                                        {formData.isActive ? 'Active - Available for budget heads' : 'Inactive - Hidden from forms'}
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/categories')}
                            disabled={saving}
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Save size={18} /> {saving ? 'Saving...' : (isEditMode ? 'Update Category' : 'Create Category')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryForm;
