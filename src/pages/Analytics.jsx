import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend, AreaChart, Area
} from 'recharts';
import { LEAD_STATUSES, INDUSTRIES, COUNTRIES, SOURCES } from '../constants';
import { TrendingUp, Users, Target, BarChart3, PieChart as PieIcon, Filter } from 'lucide-react';
import { format, subWeeks, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

const Analytics = () => {
  const [leads, setLeads] = useState(DataManager.getLeads());
  const [meetings, setMeetings] = useState(DataManager.getMeetings());
  const [audits, setAudits] = useState(DataManager.getAudits());

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  // 1. Lead Source Performance
  const sourcePerformance = SOURCES.map(source => ({
    name: source,
    leads: leads.filter(l => l.source === source).length,
    meetings: meetings.filter(m => {
      const lead = leads.find(l => l.id === m.leadId);
      return lead && lead.source === source;
    }).length
  })).sort((a, b) => b.leads - a.leads);

  // 2. Lead Status Distribution
  const statusDistribution = LEAD_STATUSES.map(status => ({
    name: status.label,
    value: leads.filter(l => l.status === status.id).length
  })).filter(s => s.value > 0);

  // 3. Performance Trend (Last 4 weeks)
  const last4Weeks = Array.from({ length: 4 }, (_, i) => {
    const start = startOfWeek(subWeeks(new Date(), 3 - i));
    const end = endOfWeek(subWeeks(new Date(), 3 - i));
    const weekLabel = `Week ${i + 1}`;
    
    const weekLeads = leads.filter(l => {
      const d = new Date(l.dateReceived);
      return d >= start && d <= end;
    }).length;

    const weekMeetings = meetings.filter(m => {
      const d = new Date(m.date);
      return d >= start && d <= end;
    }).length;

    return { name: weekLabel, leads: weekLeads, meetings: weekMeetings };
  });

  // 4. Country Breakdown
  const countryData = COUNTRIES.map(c => ({
    name: c,
    value: leads.filter(l => l.country === c).length
  })).sort((a, b) => b.value - a.value);

  // 5. Industry Breakdown
  const industryData = INDUSTRIES.map(ind => ({
    name: ind,
    value: leads.filter(l => l.industry === ind).length
  })).sort((a, b) => b.value - a.value);

  // 6. Conversion Funnel
  const funnelData = [
    { name: 'Total Leads', value: leads.length },
    { name: 'Contacted', value: leads.filter(l => ['contacted', 'interested', 'meeting-booked', 'audit-sent', 'proposal-sent', 'won'].includes(l.status)).length },
    { name: 'Interested', value: leads.filter(l => ['interested', 'meeting-booked', 'audit-sent', 'proposal-sent', 'won'].includes(l.status)).length },
    { name: 'Meeting Booked', value: leads.filter(l => ['meeting-booked', 'audit-sent', 'proposal-sent', 'won'].includes(l.status)).length },
    { name: 'Proposal Sent', value: leads.filter(l => ['proposal-sent', 'won'].includes(l.status)).length },
    { name: 'Won', value: leads.filter(l => l.status === 'won').length }
  ];

  // 7. Priority Donut
  const priorityData = [
    { name: 'Hot', value: leads.filter(l => l.priority === 'Hot').length, color: '#ef4444' },
    { name: 'Warm', value: leads.filter(l => l.priority === 'Warm').length, color: '#f59e0b' },
    { name: 'Cold', value: leads.filter(l => l.priority === 'Cold').length, color: '#3b82f6' }
  ];

  // 8. Win Rate
  const closedLeads = leads.filter(l => l.status === 'won' || l.status === 'lost');
  const winRate = closedLeads.length > 0 
    ? Math.round((leads.filter(l => l.status === 'won').length / closedLeads.length) * 100) 
    : 0;

  // 9. Revenue Analytics
  const wonLeads = leads.filter(l => l.status === 'won');
  const totalRevenue = wonLeads.reduce((acc, l) => acc + (parseFloat(l.closingAmount) || 0), 0);

  const revenueBySource = SOURCES.map(source => ({
    name: source,
    value: leads
      .filter(l => l.source === source && l.status === 'won')
      .reduce((acc, l) => acc + (parseFloat(l.closingAmount) || 0), 0)
  })).filter(s => s.value > 0).sort((a, b) => b.value - a.value);

  const revenueByWeek = Array.from({ length: 4 }, (_, i) => {
    const start = startOfWeek(subWeeks(new Date(), 3 - i));
    const end = endOfWeek(subWeeks(new Date(), 3 - i));
    const weekLabel = `Week ${i + 1}`;
    
    const weekRevenue = leads
      .filter(l => {
        const d = new Date(l.dateReceived);
        return l.status === 'won' && d >= start && d <= end;
      })
      .reduce((acc, l) => acc + (parseFloat(l.closingAmount) || 0), 0);

    return { name: weekLabel, revenue: weekRevenue };
  });

  const revenueByMonth = Array.from({ length: 6 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const monthLabel = format(d, 'MMM');
    const monthKey = format(d, 'yyyy-MM');
    
    const monthRevenue = leads
      .filter(l => l.status === 'won' && l.dateReceived && l.dateReceived.startsWith(monthKey))
      .reduce((acc, l) => acc + (parseFloat(l.closingAmount) || 0), 0);

    return { name: monthLabel, revenue: monthRevenue };
  });

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <p className="text-sm text-text-secondary">Deep dive into sales metrics and trends</p>
        </div>
        <div className="card-secondary p-2 flex items-center gap-4">
          <div className="text-center px-4 border-r border-white/5">
            <div className="text-[10px] text-text-secondary uppercase font-bold">Total Revenue</div>
            <div className="text-xl font-black text-emerald-500">{totalRevenue.toLocaleString()} AED</div>
          </div>
          <div className="text-center px-4 border-r border-white/5">
            <div className="text-[10px] text-text-secondary uppercase font-bold">Global Win Rate</div>
            <div className="text-xl font-black text-success">{winRate}%</div>
          </div>
          <div className="text-center px-4">
            <div className="text-[10px] text-text-secondary uppercase font-bold">Total Pipeline</div>
            <div className="text-xl font-black text-primary">{leads.length}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lead Source Performance */}
        <ChartCard title="Lead Source Performance" icon={<TrendingUp size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sourcePerformance} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" horizontal={false} />
              <XAxis type="number" stroke="#555" fontSize={10} />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={80} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend iconType="square" verticalAlign="top" height={36}/>
              <Bar dataKey="leads" fill="#3b82f6" name="Total Leads" barSize={12} />
              <Bar dataKey="meetings" fill="#10b981" name="Meetings" barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Status Distribution */}
        <ChartCard title="Lead Status Distribution" icon={<PieIcon size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {statusDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Revenue Analytics Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-6 mt-8">
            <TrendingUp className="text-emerald-500" size={24} />
            <h2 className="text-xl font-bold">Revenue Analytics</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ChartCard title="Revenue by Source">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={revenueBySource}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {revenueBySource.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    formatter={(value) => `${value.toLocaleString()} AED`}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} wrapperStyle={{ fontSize: '10px' }}/>
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Weekly Revenue Trend">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={revenueByWeek}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" fontSize={10} />
                  <YAxis stroke="#555" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    formatter={(value) => `${value.toLocaleString()} AED`}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Monthly Revenue Trend">
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={revenueByMonth}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#555" fontSize={10} />
                  <YAxis stroke="#555" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    formatter={(value) => `${value.toLocaleString()} AED`}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRev)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        </div>

        {/* Monthly Trend */}
        <ChartCard title="Monthly Performance Trend" icon={<BarChart3 size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={last4Weeks}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={10} />
              <YAxis stroke="#555" fontSize={10} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
              />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 4 }} />
              <Line type="monotone" dataKey="meetings" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Conversion Funnel */}
        <ChartCard title="Conversion Funnel" icon={<Filter size={18} />}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="vertical" margin={{ left: 60 }}>
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={10} width={100} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
              />
              <Bar dataKey="value" fill="#3b82f6" barSize={30}>
                {funnelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Geo & Industry Split */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:col-span-2">
          <ChartCard title="Regional Breakdown">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={countryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={8} />
                <YAxis stroke="#555" fontSize={10} />
                <Bar dataKey="value" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Industry Split">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={industryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#555" fontSize={8} />
                <YAxis stroke="#555" fontSize={10} />
                <Bar dataKey="value" fill="#ec4899" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, icon, children }) => (
  <div className="card">
    <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-4">
      <div className="text-primary">{icon}</div>
      <h2 className="text-sm font-bold uppercase tracking-widest">{title}</h2>
    </div>
    {children}
  </div>
);

export default Analytics;
