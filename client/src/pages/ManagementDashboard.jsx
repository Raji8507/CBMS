import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
    reportAPI,
    expenditureAPI,
    budgetProposalAPI,
    allocationAPI
} from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getCurrentFinancialYear } from '../utils/dateUtils';
import PageHeader from '../components/Common/PageHeader';
import StatCard from '../components/Common/StatCard';
import ContentCard from '../components/Common/ContentCard';
import Button from '../components/Common/Button';
import StatusBadge from '../components/Common/StatusBadge';
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Clock,
    Wallet,
    CreditCard,
    FileText,
    PieChart,
    BarChart3,
    ChevronRight,
    ClipboardList
} from 'lucide-react';
import './ManagementDashboard.scss';

const ManagementDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { socket } = useSocket();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const [approvals, setApprovals] = useState({ proposals: [], expenditures: [] });
    const [activeTab, setActiveTab] = useState('expenditures');
    const [approvingItem, setApprovingItem] = useState(null);

    const currentFY = getCurrentFinancialYear();

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await reportAPI.getDashboardReport({ financialYear: currentFY });
            if (response.data.success) {
                setDashboardData(response.data.data.consolidated);
            }
        } catch (error) {
            console.error("Management Dashboard fetch error", error);
        }
    }, [currentFY]);

    const fetchApprovals = useCallback(async () => {
        try {
            // Principal/VP approve items with status 'verified_by_hod' for Proposals
            // and 'HOD_VERIFIED' for Expenditures
            const [expRes, propRes] = await Promise.all([
                expenditureAPI.getExpenditures({ status: 'HOD_VERIFIED' }),
                budgetProposalAPI.getBudgetProposals({ status: 'HOD_VERIFIED' })
            ]);

            setApprovals({
                expenditures: expRes.data?.data?.expenditures || [],
                proposals: propRes.data?.data?.proposals || propRes.data?.data?.budgetProposals || []
            });
        } catch (error) {
            console.error("Approvals fetch error", error);
        }
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            await Promise.all([fetchDashboardData(), fetchApprovals()]);
            setLoading(false);
        };
        init();
    }, [fetchDashboardData, fetchApprovals]);

    // Real-time updates
    useEffect(() => {
        if (!socket) return;
        const handleUpdate = () => {
            fetchDashboardData();
            fetchApprovals();
        };
        socket.on('dashboard_update', handleUpdate);
        socket.on('notification', handleUpdate);
        return () => {
            socket.off('dashboard_update', handleUpdate);
            socket.off('notification', handleUpdate);
        };
    }, [socket, fetchDashboardData, fetchApprovals]);

    const handleQuickAction = async (item, type, action) => {
        try {
            setApprovingItem(item._id);
            const api = type === 'expenditure' ? expenditureAPI : budgetProposalAPI;

            if (action === 'approve') {
                if (type === 'expenditure') {
                    await api.approveExpenditure(item._id, { remarks: 'Approved via Command Center' });
                } else {
                    await api.approveBudgetProposal(item._id, { remarks: 'Approved via Command Center' });
                }
            } else {
                if (type === 'expenditure') {
                    await api.rejectExpenditure(item._id, { remarks: 'Rejected via Command Center' });
                } else {
                    await api.rejectBudgetProposal(item._id, { remarks: 'Rejected via Command Center' });
                }
            }

            fetchApprovals();
            fetchDashboardData();
        } catch (error) {
            console.error(`Quick ${action} error`, error);
            alert(`Failed to ${action} item`);
        } finally {
            setApprovingItem(null);
        }
    };

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val || 0);
    };

    const getUtilizationBarOption = () => {
        if (!dashboardData?.departmentBreakdown) return {};

        const depts = Object.keys(dashboardData.departmentBreakdown);
        const data = depts.map(dept => {
            const util = Math.round(dashboardData.departmentBreakdown[dept].utilization || 0);
            return {
                value: util,
                itemStyle: {
                    color: util > 90 ? '#ef4444' : util > 75 ? '#f59e0b' : '#10b981'
                }
            };
        });

        return {
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'shadow' },
                formatter: '{b}: {c}%'
            },
            grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
            xAxis: { type: 'value', max: 100, axisLabel: { formatter: '{value}%' } },
            yAxis: { type: 'category', data: depts },
            series: [{
                name: 'Utilization',
                type: 'bar',
                data: data,
                barWidth: '60%',
                label: { show: true, position: 'right', formatter: '{c}%' }
            }]
        };
    };

    const getDistributionPieOption = () => {
        if (!dashboardData?.budgetHeadBreakdown) return {};

        const pieData = Object.keys(dashboardData.budgetHeadBreakdown).map(head => ({
            name: head,
            value: dashboardData.budgetHeadBreakdown[head].allocated
        })).filter(item => item.value > 0);

        return {
            tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
            legend: { orient: 'vertical', left: 'left', show: false },
            series: [{
                name: 'Allocations',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: true,
                itemStyle: { borderRadius: 10, borderColor: '#fff', borderWidth: 2 },
                label: { show: true, position: 'outside' },
                data: pieData
            }]
        };
    };

    if (loading) return <div className="management-dashboard-loading">Initializing Command Center...</div>;

    const {
        totalAllocated = 0,
        totalUtilized = 0,
        totalPending = 0,
        remainingBalance = 0,
        utilizationPercentage = 0
    } = dashboardData || {};

    return (
        <div className="management-dashboard">
            <PageHeader
                title="Management Command Center"
                subtitle={`Financial Year ${currentFY}`}
            />

            {/* 1. Financial Health Summary */}
            <div className="health-summary-row">
                <StatCard
                    title="Total Sanctioned"
                    value={formatCurrency(totalAllocated)}
                    icon={<Wallet size={24} />}
                    tooltipText="Total budget sanctioned by office for all departments"
                />
                <StatCard
                    title="Finalized Spent"
                    value={formatCurrency(totalUtilized)}
                    icon={<CheckCircle size={24} />}
                    color="var(--success)"
                    tooltipText="Only Office-sanctioned Phase 2 expenditures"
                />
                <StatCard
                    title="Pending Commitments"
                    value={formatCurrency(totalPending)}
                    icon={<Clock size={24} />}
                    isPending={true}
                    tooltipText="Expenditures awaiting final office sanction"
                />
                <StatCard
                    title="Remaining Budget"
                    value={formatCurrency(remainingBalance)}
                    icon={<CreditCard size={24} />}
                    tooltipText="Sanctioned Budget minus Finalized Spent"
                />
                <div className={`utilization-meter-card ${utilizationPercentage > 90 ? 'critical' : utilizationPercentage > 75 ? 'warning' : 'healthy'}`}>
                    <div className="label">Overall Utilization</div>
                    <div className="value">{Math.round(utilizationPercentage)}%</div>
                    <div className="progress-bg">
                        <div className="progress-fill" style={{ width: `${utilizationPercentage}%` }}></div>
                    </div>
                </div>
            </div>

            {/* 2. Primary Analytics */}
            <div className="analytics-grid">
                <ContentCard title="Departmental Risk Monitor (Utilization %)" icon={<BarChart3 size={18} />}>
                    <ReactECharts option={getUtilizationBarOption()} style={{ height: '350px' }} />
                </ContentCard>

                <ContentCard title="Budget Head Distribution" icon={<PieChart size={18} />}>
                    <ReactECharts option={getDistributionPieOption()} style={{ height: '350px' }} />
                </ContentCard>
            </div>

            {/* 3. Approval Control Center */}
            <div className="approval-control-center">
                <div className="section-header">
                    <h3><CheckCircle size={20} /> Approval Control Center</h3>
                    <div className="tabs">
                        <button
                            className={activeTab === 'expenditures' ? 'active' : ''}
                            onClick={() => setActiveTab('expenditures')}
                        >
                            Event Expenditures ({approvals.expenditures.length})
                        </button>
                        <button
                            className={activeTab === 'proposals' ? 'active' : ''}
                            onClick={() => setActiveTab('proposals')}
                        >
                            Budget Proposals ({approvals.proposals.length})
                        </button>
                    </div>
                </div>

                <div className="approval-list-container">
                    {activeTab === 'expenditures' ? (
                        approvals.expenditures.length > 0 ? (
                            <div className="approval-grid">
                                {approvals.expenditures.map(item => (
                                    <div key={item._id} className="approval-card">
                                        <div className="card-top">
                                            <div className="dept">{item.department?.name}</div>
                                            <div className="amount">{formatCurrency(item.totalAmount)}</div>
                                        </div>
                                        <div className="event-name">{item.eventName}</div>
                                        <div className="meta">
                                            <span><FileText size={14} /> {item.budgetHead?.name}</span>
                                            <span><ChevronRight size={14} /> {item.status.replace(/_/g, ' ')}</span>
                                        </div>
                                        <div className="actions">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate('/approvals')}
                                            >
                                                Review Details
                                            </Button>
                                            <div className="quick-actions">
                                                <button
                                                    className="btn-approve"
                                                    disabled={approvingItem === item._id}
                                                    onClick={() => handleQuickAction(item, 'expenditure', 'approve')}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    disabled={approvingItem === item._id}
                                                    onClick={() => handleQuickAction(item, 'expenditure', 'reject')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <CheckCircle size={48} />
                                <p>All event expenditures are cleared!</p>
                            </div>
                        )
                    ) : (
                        approvals.proposals.length > 0 ? (
                            <div className="approval-grid">
                                {approvals.proposals.map(item => (
                                    <div key={item._id} className="approval-card proposal">
                                        <div className="card-top">
                                            <div className="dept">{item.department?.name}</div>
                                            <div className="amount">{formatCurrency(item.totalProposedAmount)}</div>
                                        </div>
                                        <div className="title">Yearly Budget Proposal</div>
                                        <div className="meta">
                                            <span><ClipboardList size={14} /> {item.proposalItems?.length} Budget Heads</span>
                                        </div>
                                        <div className="actions">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => navigate(`/budget-proposals/${item._id}`)}
                                            >
                                                View Proposal
                                            </Button>
                                            <div className="quick-actions">
                                                <button
                                                    className="btn-approve"
                                                    disabled={approvingItem === item._id}
                                                    onClick={() => handleQuickAction(item, 'proposal', 'approve')}
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    className="btn-reject"
                                                    disabled={approvingItem === item._id}
                                                    onClick={() => handleQuickAction(item, 'proposal', 'reject')}
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="empty-state">
                                <CheckCircle size={48} />
                                <p>No pending budget proposals</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagementDashboard;
