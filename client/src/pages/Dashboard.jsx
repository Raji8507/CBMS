import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { useAuth } from '../context/AuthContext';
import { expenditureAPI, allocationAPI } from '../services/api';
import {
  Wallet,
  PieChart,
  FileText,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      allocated: { value: 0, trend: 0 },
      utilized: { value: 0, trend: 0 },
      requests: { value: 0, trend: 0 },
      balance: { value: 0, trend: 0 }
    },
    activities: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, expendituresRes, allocationRes] = await Promise.all([
        expenditureAPI.getExpenditureStats({ financialYear: '2023-2024' }),
        expenditureAPI.getExpenditures({ limit: 5 }),
        allocationAPI.getAllocationStats({ financialYear: '2023-2024' })
      ]);

      const allocated = allocationRes.data.data.summary.totalAllocated || 0;
      const utilized = statsRes.data.data.summary.totalAmount || 0;
      const requests = expendituresRes.data.data.total || 0;
      const balance = allocated - utilized;

      // Logic check for 0 values
      const getTrend = (val, mockTrend) => (val === 0 ? 0 : mockTrend);

      setDashboardData({
        stats: {
          allocated: { value: allocated, trend: getTrend(allocated, 5) }, // Mock +5%
          utilized: { value: utilized, trend: getTrend(utilized, 12) },   // Mock +12%
          requests: { value: requests, trend: getTrend(requests, -2) },   // Mock -2%
          balance: { value: balance, trend: getTrend(balance, 1) }        // Mock +1%
        },
        activities: expendituresRes.data.data.expenditures
      });
    } catch (error) {
      console.error("Dashboard fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Mock Data for Charts (matching reference image style)
  const barChartOption = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Budget Year', 'Expenditure'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '10%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'jul', 'Aug', 'Sep', 'Oct', 'Nov'],
      axisLine: { show: false },
      axisTick: { show: false }
    },
    yAxis: { type: 'value', splitLine: { lineStyle: { type: 'dashed' } } },
    series: [
      {
        name: 'Budget Year',
        type: 'bar',
        data: [800, 600, 700, 600, 700, 900, 700, 800, 800, 900, 900],
        itemStyle: { color: '#1a237e', borderRadius: [4, 4, 0, 0] },
        barWidth: 12
      },
      {
        name: 'Expenditure',
        type: 'bar',
        data: [400, 600, 750, 450, 450, 800, 500, 850, 500, 650, 600],
        itemStyle: { color: '#3b82f6', borderRadius: [4, 4, 0, 0] },
        barWidth: 12
      }
    ]
  };

  const pieChartOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        name: 'Distribution',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 14, fontWeight: 'bold' } },
        data: [
          { value: 1048, name: 'Department', itemStyle: { color: '#1a237e' } },
          { value: 735, name: 'Fleeting', itemStyle: { color: '#3b82f6' } },
          { value: 580, name: 'Others', itemStyle: { color: '#9ca3af' } }
        ]
      }
    ]
  };

  return (
    <div className="dashboard-container">
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      {/* Top Stats Row */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper blue">
              <Wallet size={24} />
            </div>
            {dashboardData.stats.allocated.value > 0 && (
              <div className="stat-trend positive">
                <ArrowUpRight size={14} /> +{dashboardData.stats.allocated.trend}%
              </div>
            )}
            {dashboardData.stats.allocated.value === 0 && (
              <div className="stat-trend neutral" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                 0%
              </div>
            )}
          </div>
          <div>
            <div className="stat-label">Total Budget Allocated</div>
            <div className="stat-value">{formatCurrency(dashboardData.stats.allocated.value)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper green">
              <PieChart size={24} />
            </div>
            {dashboardData.stats.utilized.value > 0 && (
              <div className="stat-trend positive">
                <ArrowUpRight size={14} /> +{dashboardData.stats.utilized.trend}%
              </div>
            )}
            {dashboardData.stats.utilized.value === 0 && (
              <div className="stat-trend neutral" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                 0%
              </div>
            )}
          </div>
          <div>
            <div className="stat-label">Total Utilized</div>
            <div className="stat-value">{formatCurrency(dashboardData.stats.utilized.value)}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper orange">
              <FileText size={24} />
            </div>
            {dashboardData.stats.requests.value > 0 && (
              <div className="stat-trend negative">
                <ArrowDownRight size={14} /> {dashboardData.stats.requests.trend}%
              </div>
            )}
            {dashboardData.stats.requests.value === 0 && (
              <div className="stat-trend neutral" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                 0%
              </div>
            )}
          </div>
          <div>
            <div className="stat-label">Pending Approvals</div>
            <div className="stat-value">{dashboardData.stats.requests.value} Requests</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <div className="stat-icon-wrapper purple">
              <CreditCard size={24} />
            </div>
            {dashboardData.stats.balance.value > 0 && (
              <div className="stat-trend positive">
                <ArrowUpRight size={14} /> +{dashboardData.stats.balance.trend}%
              </div>
            )}
            {dashboardData.stats.balance.value === 0 && (
              <div className="stat-trend neutral" style={{ background: '#f3f4f6', color: '#6b7280' }}>
                 0%
              </div>
            )}
          </div>
          <div>
            <div className="stat-label">Remaining Balance</div>
            <div className="stat-value">{formatCurrency(dashboardData.stats.balance.value)}</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="charts-section">
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Budget vs. Expenditure (Financial Year)</div>
          </div>
          <ReactECharts option={barChartOption} style={{ height: '320px', width: '100%' }} />
        </div>
        <div className="chart-card">
          <div className="chart-header">
            <div className="chart-title">Department-wise Distribution</div>
          </div>
          <ReactECharts option={pieChartOption} style={{ height: '320px', width: '100%' }} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-section">
        <div className="section-header">
          <div className="section-title">Recent Activity</div>
        </div>
        <table className="activity-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Requester</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.activities.map((item, idx) => (
              <tr key={item._id}>
                <td>1278{idx + 1}</td>
                <td>{item.partyName || "Finance Officer"}</td>
                <td className="activity-amount">{formatCurrency(item.billAmount)}</td>
                <td>
                  <span className={`status-badge ${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{new Date(item.submittedAt).toLocaleDateString('en-CA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
