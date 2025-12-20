import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { departmentsAPI, usersAPI } from '../services/api';
import Tooltip from '../components/Tooltip/Tooltip';
import PageHeader from '../components/Common/PageHeader';
import StatCard from '../components/Common/StatCard';
import { Plus, Pencil, Trash2, Building, Users as UsersIcon } from 'lucide-react';
import './Departments.css';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const response = await departmentsAPI.getDepartments();
      setDepartments(response.data.data.departments);
      setError(null);
    } catch (err) {
      setError('Failed to fetch departments');
      console.error('Error fetching departments:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await departmentsAPI.getDepartmentStats();
      setStats(response.data.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await departmentsAPI.deleteDepartment(id);
        fetchDepartments();
        fetchStats();
      } catch (err) {
        setError('Failed to delete department');
        console.error('Error deleting department:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="departments-container">
        <div className="loading">Loading departments...</div>
      </div>
    );
  }

  return (
    <div className="departments-container">
      <PageHeader
        title="Departments Management"
        subtitle="Manage academic and administrative departments"
      >
        <Link to="/departments/add" className="btn btn-primary">
          <Plus size={18} /> Add Department
        </Link>
      </PageHeader>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {stats && (
        <div className="stats-grid">
          <StatCard
            title="Total Departments"
            value={stats.totalDepartments}
            icon={<Building size={24} />}
            color="var(--primary)"
          />
          <StatCard
            title="Active Departments"
            value={stats.activeDepartments}
            icon={<Building size={24} />}
            color="var(--success)"
          />
          <StatCard
            title="With HOD"
            value={stats.departmentsWithHOD}
            icon={<UsersIcon size={24} />}
            color="var(--info)"
          />
          <StatCard
            title="Without HOD"
            value={stats.departmentsWithoutHOD}
            icon={<UsersIcon size={24} />}
            color="var(--warning)"
          />
        </div>
      )}

      <div className="departments-table-container">
        <table className="departments-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>HOD</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((dept) => (
              <tr key={dept._id}>
                <td>{dept.name}</td>
                <td>
                  <span className="dept-code">{dept.code}</span>
                </td>
                <td>{dept.description || '-'}</td>
                <td>
                  {dept.hodInfo ? (
                    <div className="hod-info">
                      <div className="hod-name">{dept.hodInfo.name}</div>
                      <div className="hod-email">{dept.hodInfo.email}</div>
                    </div>
                  ) : (
                    <span className="no-hod">No HOD assigned</span>
                  )}
                </td>
                <td>
                  <span className={`status ${dept.isActive ? 'active' : 'inactive'}`}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <Tooltip text="Edit Department" position="top">
                      <Link
                        to={`/departments/edit/${dept._id}`}
                        className="btn btn-sm btn-secondary"
                      >
                        <Pencil size={16} />
                      </Link>
                    </Tooltip>
                    <Tooltip text="Delete Department" position="top">
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(dept._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </Tooltip>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Departments;
