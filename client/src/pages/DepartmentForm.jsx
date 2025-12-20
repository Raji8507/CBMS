import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { departmentsAPI, usersAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import { Building, Users, AlertCircle, Save, X, ArrowLeft } from 'lucide-react';
import './DepartmentForm.css';

const DepartmentForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        name: '',
        code: '',
        description: '',
        hod: '',
        isActive: true
    });

    const [hodUsers, setHodUsers] = useState([]);
    const [loading, setLoading] = useState(isEditMode);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHODs();
        if (isEditMode) {
            fetchDepartment();
        }
    }, [id]);

    const fetchHODs = async () => {
        try {
            const response = await usersAPI.getUsersByRole('hod');
            if (response.data.success) {
                setHodUsers(response.data.data.users);
            }
        } catch (err) {
            console.error('Error fetching HODs:', err);
        }
    };

    const fetchDepartment = async () => {
        try {
            setLoading(true);
            const response = await departmentsAPI.getDepartmentById(id);
            if (response.data.success) {
                const dept = response.data.data.department;
                setFormData({
                    name: dept.name,
                    code: dept.code,
                    description: dept.description || '',
                    hod: dept.hod?._id || dept.hod || '',
                    isActive: dept.isActive
                });
            }
        } catch (err) {
            setError('Failed to fetch department details');
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
            const submitData = { ...formData };
            if (!submitData.hod) submitData.hod = null;

            if (isEditMode) {
                await departmentsAPI.updateDepartment(id, submitData);
            } else {
                await departmentsAPI.createDepartment(submitData);
            }
            navigate('/departments');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save department');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="form-page-container">
                <div className="loading">Loading department data...</div>
            </div>
        );
    }

    return (
        <div className="form-page-container">
            <PageHeader
                title={isEditMode ? "Edit Department" : "Add New Department"}
                subtitle={isEditMode ? `Updating ${formData.name}` : "Create a new academic or administrative department"}
            >
                <button className="btn btn-secondary" onClick={() => navigate('/departments')}>
                    <ArrowLeft size={18} /> Back to Departments
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
                            <Building size={18} />
                            Department Information
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Department Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="e.g., Computer Science"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Department Code *</label>
                                <input
                                    type="text"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleChange}
                                    required
                                    className="form-input"
                                    placeholder="e.g., CS"
                                    style={{ textTransform: 'uppercase' }}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Tell something about the department..."
                                    rows="3"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3 className="section-title">
                            <Users size={18} />
                            Administration
                        </h3>

                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">Head of Department (HOD)</label>
                                <select
                                    name="hod"
                                    value={formData.hod}
                                    onChange={handleChange}
                                    className="form-input"
                                >
                                    <option value="">Select HOD (Optional)</option>
                                    {hodUsers.map(user => (
                                        <option key={user._id} value={user._id}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="form-help">Only users with 'Hod' role appear here.</p>
                            </div>

                            {isEditMode && (
                                <div className="form-group">
                                    <label className="form-label">Status</label>
                                    <div className="checkbox-item active-toggle">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            name="isActive"
                                            checked={formData.isActive}
                                            onChange={handleChange}
                                        />
                                        <label htmlFor="isActive">
                                            {formData.isActive ? 'Active - Department is operational' : 'Inactive - Department is disabled'}
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => navigate('/departments')}
                            disabled={saving}
                        >
                            <X size={18} /> Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            <Save size={18} /> {saving ? 'Saving...' : (isEditMode ? 'Update Department' : 'Create Department')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DepartmentForm;
