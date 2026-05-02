import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  TrendingUp, 
  Wallet, 
  Target, 
  Award,
  ChevronRight,
  Filter,
  Search
} from 'lucide-react';
import { cn } from '../utils/cn';

const Incentives = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchLeads = async () => {
      const data = await DataManager.getLeads();
      setLeads(Array.isArray(data) ? data : []);
    };
    fetchLeads();
  }, []);

  // Calculate stats
  const wonLeads = leads.filter(l => l.status === 'won');
  
  const calculateIncentive = (lead) => {
    const rate = parseFloat(lead.incentive) || (lead.source === 'Affiliate' ? 20 : 10);
    const amount = parseFloat(lead.closingAmount) || 0;
    return (amount * rate) / 100;
  };

  const totalEarnings = wonLeads.reduce((acc, lead) => acc + calculateIncentive(lead), 0);
  const potentialEarnings = leads
    .filter(l => l.status !== 'won' && l.status !== 'lost' && l.closingAmount)
    .reduce((acc, lead) => acc + calculateIncentive(lead), 0);

  const totalIncentiveRate = wonLeads.reduce((acc, lead) => {
    const rate = parseFloat(lead.incentive) || (lead.source === 'Affiliate' ? 20 : 10);
    return acc + rate;
  }, 0);

  const stats = [
    { label: 'Total Earnings (Won)', value: `${totalEarnings.toLocaleString()} AED`, icon: Wallet, color: 'text-emerald-500' },
    { label: 'Potential Earnings', value: `${potentialEarnings.toLocaleString()} AED`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Total Won Leads', value: wonLeads.length, icon: Target, color: 'text-primary' },
    { label: 'Avg. Rate (Won)', value: wonLeads.length > 0 ? `${Math.round(totalIncentiveRate / wonLeads.length)}%` : '0%', icon: Award, color: 'text-purple-500' },
  ];

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Incentives & Commissions</h1>
          <p className="text-sm text-text-secondary">Track your earnings and performance bonuses</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="card p-6 flex items-center gap-4">
            <div className={cn("p-3 bg-zinc-800/50", stat.color)}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{stat.label}</p>
              <p className="text-xl font-black">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card-secondary p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search won leads..." 
            className="input-field w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="p-2 border border-white/10 hover:bg-white/5 text-zinc-400">
          <Filter size={18} />
        </button>
      </div>

      {/* Incentive Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Source</th>
              <th>Status</th>
              <th>Closing Amount</th>
              <th>Incentive Rate</th>
              <th>Earned Incentive</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-20 text-text-secondary italic">
                  No incentive data available.
                </td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id}>
                  <td>
                    <div className="font-bold">{lead.name}</div>
                    <div className="text-[10px] text-text-secondary">{lead.company}</div>
                  </td>
                  <td className="text-xs">{lead.source}</td>
                  <td>
                    <span className={cn(
                      "badge text-white",
                      lead.status === 'won' ? "bg-emerald-500" : "bg-zinc-600"
                    )}>
                      {lead.status}
                    </span>
                  </td>
                  <td className="font-medium">
                    {lead.closingAmount ? `${parseFloat(lead.closingAmount).toLocaleString()} AED` : '---'}
                  </td>
                  <td className="text-sm font-bold text-primary">
                    {lead.incentive || (lead.source === 'Affiliate' ? '20%' : '10%')}
                  </td>
                  <td className="text-sm font-black text-emerald-500">
                    {lead.closingAmount 
                      ? `${calculateIncentive(lead).toLocaleString()} AED` 
                      : '---'}
                  </td>
                  <td>
                    <button className="p-1 hover:bg-white/5 text-zinc-400">
                      <ChevronRight size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Incentives;
