import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { usersAPI, departmentsAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import { ArrowLeft, Save, X } from 'lucide-react';
import './UserForm.css';

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;

    const ROLE_PERMISSIONS = {
        admin: { canApprove: true, exportReports: true, manageBudgets: true, manageUsers: true },
        hod: { canApprove: true, exportReports: true, manageBudgets: false, manageUsers: false },
        office: { canApprove: false, exportReports: true, manageBudgets: true, manageUsers: false },
        auditor: { canApprove: false, exportReports: true, manageBudgets: false, manageUsers: false },
        department: { canApprove: false, exportReports: false, manageBudgets: false, manageUsers: false },
        vice_principal: { canApprove: true, exportReports: true, manageBudgets: false, manageUsers: false },
        principal: { canApprove: true, exportReports: true, manageBudgets: true, manageUsers: false }
    };

    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEditMode);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: '',
        department: '',
        password: '',
        confirmPassword: '',
        isActive: true,
        permissions: {
            canApprove: false,
            exportReports: false,
            manageBudgets: false,
            manageUsers: false
        }
    });

    const roleOptions = [
        { value: 'admin', label: 'Admin' },
        { value: 'office', label: 'Office' },
        { value: 'department', label: 'Department User' },
        { value: 'hod', label: 'Hod' },
        { value: 'vice_principal', label: 'Vice Principal' },
        { value: 'principal', label: 'Principal' },
        { value: 'auditor', label: 'Auditor' }
    ];

    useEffect(() => {
        fetchDepartments();
        if (isEditMode) {
            fetchUser();
        }
    }, [id]);

    const fetchDepartments = async () => {
        try {
            const response = await departmentsAPI.getDepartments();
            setDepartments(response.data.data.departments);
        } catch (err) {
            console.error('Error fetching departments:', err);
        }
    };

    const fetchUser = async () => {
        try {
            setFetching(true);
            const response = await usersAPI.getUserById(id);
            const user = response.data.data.user;
            setFormData({
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department?._id || user.department || '',
                password: '',
                confirmPassword: '',
                isActive: user.isActive,
                permissions: user.permissions || {
                    canApprove: false,
                    exportReports: false,
                    manageBudgets: false,
                    manageUsers: false
                }
            });
        } catch (err) {
            setError('Failed to fetch user data');
            console.error(err);
        } finally {
            setFetching(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name === 'role') {
            const isDeptRole = ['department', 'hod'].includes(value);
            const defaults = !isEditMode ? (ROLE_PERMISSIONS[value] || ROLE_PERMISSIONS.department) : formData.permissions;

            setFormData(prev => ({
                ...prev,
                role: value,
                department: isDeptRole ? prev.department : '',
                permissions: { ...defaults }
            }));
            return;
        }

        if (name.startsWith('permissions.')) {
            const permKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                permissions: {
                    ...prev.permissions,
                    [permKey]: checked
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Password validation only for new users or if password field is filled
        if (!isEditMode || formData.password) {
            if (formData.password !== formData.confirmPassword) {
                setError("Passwords do not match");
                return;
            }
            if (formData.password.length < 6) {
                setError("Password must be at least 6 characters");
                return;
            }
        }

        try {
            setLoading(true);

            // Filter out empty password for updates
            const submitData = { ...formData };
            if (isEditMode && !submitData.password) {
                delete submitData.password;
                delete submitData.confirmPassword;
            }

            if (isEditMode) {
                await usersAPI.updateUser(id, submitData);
            } else {
                await usersAPI.createUser(submitData);
            }
            navigate('/users');
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} user`);
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return <div className="user-form-loading">Loading user data...</div>;
    }

    return (
        <div className="add-user-container">
            <PageHeader
                title={isEditMode ? "Edit User" : "Add New User"}
                subtitle={isEditMode ? "Update user profile and permissions" : "Create a new system user and assign permissions"}
            >
                <button className="btn btn-secondary btn-sm" onClick={() => navigate('/users')}>
                    <ArrowLeft size={18} /> Back to Users
                </button>
            </PageHeader>

            <div className="add-user-card">
                <form onSubmit={handleSubmit} className="add-user-form">
                    {error && (
                        <div className="alert alert-error mb-4">
                            <X size={20} className="mr-2" onClick={() => setError(null)} style={{ cursor: 'pointer' }} />
                            {error}
                        </div>
                    )}

                    <div className="form-sections-grid">
                        <div className="form-section">
                            <h3 className="section-title">Personal Information</h3>
                            <div className="form-group">
                                <label>Full Name</label>
                                <input
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter full name"
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter institutional email"
                                />
                            </div>
                            <div className="form-group">
                                <label>Role</label>
                                <select name="role" value={formData.role} onChange={handleInputChange} required>
                                    <option value="">Select Role</option>
                                    {roleOptions.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                            {['department', 'hod'].includes(formData.role) && (
                                <div className="form-group">
                                    <label>Department</label>
                                    <select name="department" value={formData.department} onChange={handleInputChange} required>
                                        <option value="">Select Department</option>
                                        {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <h3 className="section-title">Security</h3>
                            <div className="form-group">
                                <label>Password {isEditMode && '(Leave blank to keep current)'}</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    required={!isEditMode}
                                    minLength={6}
                                    placeholder="Enter password"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleInputChange}
                                    required={!isEditMode || !!formData.password}
                                    minLength={6}
                                    placeholder="Confirm password"
                                />
                            </div>

                            <div className="form-group checkbox-group mt-4">
                                <label className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={formData.isActive}
                                        onChange={handleInputChange}
                                    />
                                    <span>Account is Active</span>
                                </label>
                            </div>
                        </div>

                        <div className="form-section full-width">
                            <h3 className="section-title">Permissions & Access</h3>
                            <div className="permissions-grid">
                                <label className={`checkbox-item ${formData.permissions.canApprove ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="permissions.canApprove"
                                        checked={formData.permissions.canApprove}
                                        onChange={handleInputChange}
                                    />
                                    <div className="checkbox-label">
                                        <span className="label-title">Can Approve Expenditures</span>
                                        <span className="label-desc">Allows user to approve or reject budget requests.</span>
                                    </div>
                                </label>
                                <label className={`checkbox-item ${formData.permissions.exportReports ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="permissions.exportReports"
                                        checked={formData.permissions.exportReports}
                                        onChange={handleInputChange}
                                    />
                                    <div className="checkbox-label">
                                        <span className="label-title">Can Export Reports</span>
                                        <span className="label-desc">Allows downloading financial summaries and audit logs.</span>
                                    </div>
                                </label>
                                <label className={`checkbox-item ${formData.permissions.manageBudgets ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="permissions.manageBudgets"
                                        checked={formData.permissions.manageBudgets}
                                        onChange={handleInputChange}
                                    />
                                    <div className="checkbox-label">
                                        <span className="label-title">Manage Budgets</span>
                                        <span className="label-desc">Allows creating and reallocating budget heads.</span>
                                    </div>
                                </label>
                                <label className={`checkbox-item ${formData.permissions.manageUsers ? 'selected' : ''}`}>
                                    <input
                                        type="checkbox"
                                        name="permissions.manageUsers"
                                        checked={formData.permissions.manageUsers}
                                        onChange={handleInputChange}
                                    />
                                    <div className="checkbox-label">
                                        <span className="label-title">Manage Users</span>
                                        <span className="label-desc">Full access to create, edit, and delete system users.</span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn btn-secondary" onClick={() => navigate('/users')}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (
                                <>
                                    <Save size={18} className="mr-2" /> {isEditMode ? 'Update User' : 'Create User'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserForm;
