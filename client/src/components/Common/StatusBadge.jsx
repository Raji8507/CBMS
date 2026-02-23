import React from 'react';
import '../../styles/common-components.scss';

const StatusBadge = ({ status, className = '' }) => {
    const statusMap = {
        'DRAFT': { label: 'Draft', class: 'pending' },
        'PENDING': { label: 'Pending Approval', class: 'pending' },
        'HOD_VERIFIED': { label: 'Verified by HOD', class: 'info' },
        'MANAGEMENT_APPROVED': { label: 'Approved by Management', class: 'info' },
        'FINALIZED': { label: 'Finalized & Deducted', class: 'approved' },
        'ALLOCATED': { label: 'Approved & Allocated', class: 'approved' },
        'REJECTED': { label: 'Rejected', class: 'rejected' }
    };

    // Normalize: handle cases where status might be uppercase or slightly different
    const normalizedKey = status?.toUpperCase();
    const config = statusMap[normalizedKey] || { label: status || 'Unknown', class: 'neutral' };

    return (
        <span className={`status-badge status-${config.class} ${className}`}>
            {config.label}
        </span>
    );
};

export default StatusBadge;
