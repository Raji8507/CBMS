import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usersAPI, departmentsAPI } from '../services/api';
import PageHeader from '../components/Common/PageHeader';
import { Plus, UserPlus, Pencil, Trash2, X, Search, Filter, Shield, Check, RotateCw, MoreHorizontal } from 'lucide-react';
import './users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    isActive: '',
    department: ''
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
    fetchUsers();
    fetchDepartments();
  }, [filters]);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    // If it's a relative path starting with /uploads, and we're in dev,
    // we can let the Vite proxy handle it.
    if (import.meta.env.DEV && path.startsWith('/uploads')) {
      return path;
    }

    const apiBase = import.meta.env.REACT_APP_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${apiBase}${path}`;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.role) params.role = filters.role;
      if (filters.isActive) params.isActive = filters.isActive;
      if (filters.department) params.department = filters.department;

      const response = await usersAPI.getUsers(params);
      setUsers(response.data.data.users);
      setError(null);
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentsAPI.getDepartments();
      setDepartments(response.data.data.departments);
    } catch (err) {
      console.error('Error fetching departments:', err);
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
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await usersAPI.deleteUser(id);
        fetchUsers();
      } catch (err) {
        setError('Failed to delete user');
      }
    }
  };

  const getRoleLabel = (role) => {
    const roleOption = roleOptions.find(r => r.value === role);
    return roleOption ? roleOption.label : role;
  };

  const getRoleColorClass = (role) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'hod': return 'role-hod';
      case 'department': return 'role-dept';
      case 'office': return 'role-office';
      default: return 'role-default';
    }
  };

  // Helper to generate initials
  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'U';
  };

  const handleStatusToggle = async (user) => {
    const updatedUser = { ...user, isActive: !user.isActive };

    // Optimistic UI update
    setUsers(users.map(u => u._id === user._id ? updatedUser : u));

    try {
      await usersAPI.updateUser(user._id, { isActive: !user.isActive });
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update user status');
      fetchUsers(); // Revert
    }
  };

  return (
    <>
      <div className="users-content-container">

        {/* Header Section */}
        <PageHeader
          title="User Management"
          subtitle="Manage system users and their permissions"
        >
          <Link to="/users/add" className="btn btn-primary btn-sm">
            <Plus size={18} /> Add New User
          </Link>
        </PageHeader>

        {/* Filters Section */}
        <div className="users-filters-bar">
          <div className="search-wrapper">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search users..."
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="search-input"
            />
          </div>

          <div className="filter-dropdowns">
            <div className="filter-item">
              <select
                name="role"
                value={filters.role}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Filter by Role</option>
                {roleOptions.map(role => (
                  <option key={role.value} value={role.value}>{role.label}</option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <select
                name="department"
                value={filters.department}
                onChange={handleFilterChange}
                className="filter-select"
              >
                <option value="">Filter by Department</option>
                {departments.map(dept => (
                  <option key={dept._id} value={dept._id}>{dept.name}</option>
                ))}
              </select>
            </div>

            {/* Redesigned Button Placeholders matching the image */}
          </div>
        </div>

        {/* Permissions / Main Content Split */}
        <div className="main-content-area">
          <div className="table-section">
            <h3 className="section-title">Users</h3>

            <div className="users-table-wrapper">
              <table className="modern-users-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th>Status</th>
                    <th>Status Action</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan="6" className="text-center p-4">Loading...</td></tr>
                  ) : (() => {
                    // Start of IIFE to calculate admin count
                    const adminCount = users.filter(u => u.role === 'admin').length;

                    return users.map((user) => (
                      <tr
                        key={user._id}
                      >
                        <td>
                          <div className="user-profile-cell">
                            <div className="user-avatar">
                              {user.profilePicture ? (
                                <img src={getFullImageUrl(user.profilePicture)} alt={user.name} className="avatar-img" />
                              ) : (
                                getInitials(user.name)
                              )}
                            </div>
                            <div className="user-details">
                              <span className="user-name">{user.name}</span>
                              <span className="user-email">{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`role-pill ${getRoleColorClass(user.role)}`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </td>
                        <td>
                          <span className="dept-text">
                            {user.department?.name || (user.role === 'admin' ? 'Admin' : 'N/A')}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge ${user.isActive ? 'status-active' : 'status-inactive'}`}>
                            {user.isActive ? 'ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td>
                          {/* Toggle Switch Simulation */}
                          <div
                            className={`status-toggle ${user.isActive ? 'on' : 'off'}`}
                            onClick={(e) => { e.stopPropagation(); handleStatusToggle(user); }}
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            <div className="toggle-handle"></div>
                          </div>
                        </td>
                        <td>
                          <div className="action-buttons">
                            <Link to={`/users/edit/${user._id}`} className="btn btn-sm btn-secondary" title="Edit User">
                              <Pencil size={16} />
                            </Link>
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (user.role === 'admin' && adminCount <= 1) {
                                  alert("Cannot delete the last remaining admin.");
                                  return;
                                }
                                handleDelete(user._id);
                              }}
                              disabled={user.role === 'admin' && adminCount <= 1}
                              title={user.role === 'admin' && adminCount <= 1 ? "Cannot delete the last admin" : "Delete User"}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )); // End of map
                  })() // End of IIFE
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Users;
