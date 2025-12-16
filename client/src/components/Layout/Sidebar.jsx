import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  LineChart,
  Users,
  Building2,
  Wallet,
  Settings,
  ClipboardList,
  CheckSquare,
  Calculator,
  User,
  LogOut,
  FileText,
  Search,
  PlusCircle,
  Files,
  GraduationCap,
  Menu
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const getNavigationItems = () => {
    if (!user) return [];

    const baseItems = [
      { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
      { path: '/graphical-dashboard', label: 'Analytics', icon: <LineChart size={20} /> },
    ];

    switch (user.role) {
      case 'admin':
        return [
          ...baseItems,
          { path: '/users', label: 'Users', icon: <Users size={20} /> },
          { path: '/departments', label: 'Departments', icon: <Building2 size={20} /> },
          { path: '/budget-heads', label: 'Budget Heads', icon: <Wallet size={20} /> },
          { path: '/settings', label: 'Settings', icon: <Settings size={20} /> },
        ];
      case 'office':
        return [
          ...baseItems,
          { path: '/allocations', label: 'Allocations', icon: <ClipboardList size={20} /> },
          { path: '/approvals', label: 'Approvals', icon: <CheckSquare size={20} /> },
          { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
        ];
      case 'department':
        return [
          ...baseItems,
          { path: '/expenditures', label: 'My Expenditures', icon: <Calculator size={20} /> },
          { path: '/submit-expenditure', label: 'Submit Expenditure', icon: <PlusCircle size={20} /> },
        ];
      case 'hod':
        return [
          ...baseItems,
          { path: '/department-expenditures', label: 'Department Expenditures', icon: <Files size={20} /> },
          { path: '/approvals', label: 'Approvals', icon: <CheckSquare size={20} /> },
        ];
      case 'vice_principal':
      case 'principal':
        return [
          ...baseItems,
          { path: '/approvals', label: 'Approvals', icon: <CheckSquare size={20} /> },
          { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
          { path: '/consolidated-view', label: 'Consolidated View', icon: <LineChart size={20} /> },
        ];
      case 'auditor':
        return [
          ...baseItems,
          { path: '/audit-logs', label: 'Audit Logs', icon: <Search size={20} /> },
          { path: '/reports', label: 'Reports', icon: <FileText size={20} /> },
        ];
      default:
        return baseItems;
    }
  };

  return (
    <>
      <div 
        className={`mobile-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header">
           <button className="sidebar-toggle-btn" onClick={toggleSidebar} title="Toggle Sidebar">
             <div className="sidebar-logo-icon">
               {isExpanded ? <Menu size={24} color="white" /> : <GraduationCap size={24} color="white" />}
             </div>
           </button>
           
           <div className="sidebar-logo-text-container">
              <div className="sidebar-logo-text">CBMS</div>
              <div className="sidebar-subtitle">Finance Manager</div>
           </div>
        </div>

        <nav className="sidebar-nav">
          {getNavigationItems().map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => window.innerWidth < 1024 && onClose()}
            >
              <span className="nav-item-icon">{item.icon}</span>
              <span className="nav-item-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
