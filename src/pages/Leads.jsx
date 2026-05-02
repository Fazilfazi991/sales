import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Phone, 
  MessageCircle, 
  Mail, 
  Calendar,
  X,
  Edit,
  Trash2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { LEAD_STATUSES, INDUSTRIES, COUNTRIES, SOURCES } from '../constants';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  function getInitialFormData() {
    return {
      name: '',
      company: '',
      industry: 'Real Estate',
      country: 'UAE',
      phone: '',
      whatsapp: '',
      email: '',
      source: 'Meta Ads',
      campaign: '',
      dateReceived: format(new Date(), 'yyyy-MM-dd'),
      priority: 'Warm',
      notes: '',
      followUpDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'new',
      incentive: '10%',
      closingAmount: ''
    };
  }

  const fetchLeads = async () => {
    const data = await DataManager.getLeads();
    setLeads(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    fetchLeads();
  }, [isModalOpen, isDetailOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    await DataManager.saveLead({ ...formData, id: formData.id || Date.now().toString() });
    setIsModalOpen(false);
    setFormData(getInitialFormData());
    fetchLeads();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      await DataManager.deleteLead(id);
      fetchLeads();
    }
  };

  const openEdit = (lead) => {
    setFormData(lead);
    setIsModalOpen(true);
  };

  const openDetail = (lead) => {
    setSelectedLead(lead);
    setIsDetailOpen(true);
  };

  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Lead Pipeline</h1>
          <p className="text-sm text-text-secondary">Manage and track your sales prospects</p>
        </div>
        <button 
          onClick={() => { setFormData(getInitialFormData()); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add New Lead</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card-secondary p-4 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input 
            type="text" 
            placeholder="Search leads or companies..." 
            className="input-field w-full pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="input-field min-w-[150px]"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            {LEAD_STATUSES.map(s => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <button className="p-2 border border-white/10 hover:bg-white/5 text-zinc-400">
            <Filter size={18} />
          </button>
        </div>
      </div>

      {/* Lead Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Company</th>
              <th>Source</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Incentive</th>
              <th>Follow-up</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-20 text-text-secondary italic">
                  No leads found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredLeads.map(lead => (
                <tr key={lead.id} className="cursor-pointer" onClick={() => openDetail(lead)}>
                  <td>
                    <div className="font-bold">{lead.name}</div>
                    <div className="text-[10px] text-text-secondary">{lead.country} | {lead.industry}</div>
                  </td>
                  <td>{lead.company}</td>
                  <td className="text-xs">{lead.source}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-2 h-2",
                        lead.priority === 'Hot' ? "bg-danger" : lead.priority === 'Warm' ? "bg-warning" : "bg-primary"
                      )} />
                      <span className="text-xs">{lead.priority}</span>
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "badge text-white",
                      LEAD_STATUSES.find(s => s.id === lead.status)?.color || "bg-zinc-600"
                    )}>
                      {LEAD_STATUSES.find(s => s.id === lead.status)?.label}
                    </span>
                  </td>
                  <td className="text-xs font-bold text-emerald-500">
                    {lead.closingAmount 
                      ? `${(parseFloat(lead.closingAmount) * parseFloat(lead.incentive || (lead.source === 'Affiliate' ? '20' : '10')) / 100).toLocaleString()} AED`
                      : lead.incentive || (lead.source === 'Affiliate' ? '20%' : '10%')
                    }
                  </td>
                  <td>
                    <div className={cn(
                      "text-xs flex items-center gap-1",
                      lead.followUpDate < format(new Date(), 'yyyy-MM-dd') ? "text-danger" : "text-text-secondary"
                    )}>
                      <Calendar size={12} />
                      {lead.followUpDate}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => openEdit(lead)}
                        className="p-1.5 hover:bg-white/5 text-zinc-400 hover:text-white"
                      >
                        <Edit size={16} />
                      </button>
                      <a 
                        href={`https://wa.me/${lead.whatsapp}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="p-1.5 hover:bg-emerald-500/10 text-emerald-500"
                      >
                        <MessageCircle size={16} />
                      </a>
                      <button 
                        onClick={() => handleDelete(lead.id)}
                        className="p-1.5 hover:bg-danger/10 text-danger"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-card border-l border-white/10 p-8 overflow-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">{formData.id ? 'Edit Lead' : 'Add New Lead'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Lead Name</label>
                  <input 
                    type="text" required className="input-field w-full" 
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Company Name</label>
                  <input 
                    type="text" required className="input-field w-full" 
                    value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Industry</label>
                  <select 
                    className="input-field w-full"
                    value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})}
                  >
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Country</label>
                  <select 
                    className="input-field w-full"
                    value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})}
                  >
                    {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Phone Number</label>
                  <input 
                    type="text" className="input-field w-full" 
                    value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">WhatsApp Number</label>
                  <input 
                    type="text" className="input-field w-full" 
                    value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Email Address</label>
                  <input 
                    type="email" className="input-field w-full" 
                    value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Lead Source</label>
                  <select 
                    className="input-field w-full"
                    value={formData.source} 
                    onChange={e => {
                      const source = e.target.value;
                      const incentive = source === 'Affiliate' ? '20%' : '10%';
                      setFormData({...formData, source, incentive});
                    }}
                  >
                    {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Incentive (%)</label>
                  <input 
                    type="text" className="input-field w-full bg-emerald-500/5 text-emerald-500 font-bold" 
                    value={formData.incentive} 
                    onChange={e => setFormData({...formData, incentive: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Closing Amount (AED)</label>
                  <input 
                    type="number" className="input-field w-full" 
                    placeholder="e.g. 5000"
                    value={formData.closingAmount} 
                    onChange={e => setFormData({...formData, closingAmount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <div className="flex gap-4">
                    {['Hot', 'Warm', 'Cold'].map(p => (
                      <label key={p} className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" name="priority" value={p} 
                          checked={formData.priority === p}
                          onChange={e => setFormData({...formData, priority: e.target.value})}
                          className="accent-primary"
                        />
                        <span className="text-sm">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select 
                    className="input-field w-full"
                    value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    {LEAD_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Follow-up Date</label>
                  <input 
                    type="date" className="input-field w-full" 
                    value={formData.followUpDate} onChange={e => setFormData({...formData, followUpDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Date Received</label>
                  <input 
                    type="date" className="input-field w-full" 
                    value={formData.dateReceived} onChange={e => setFormData({...formData, dateReceived: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="label">Initial Notes</label>
                <textarea 
                  className="input-field w-full h-32 resize-none"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">
                  {formData.id ? 'Update Lead' : 'Create Lead'}
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary flex-1 py-3"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Slide-over */}
      {isDetailOpen && selectedLead && (
        <div className="fixed inset-0 z-[60] flex items-center justify-end bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl h-full bg-card border-l border-white/10 p-8 overflow-auto animate-in slide-in-from-right duration-300">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                  {selectedLead.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedLead.name}</h2>
                  <p className="text-sm text-text-secondary uppercase tracking-widest">{selectedLead.company}</p>
                </div>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8">
              <DetailItem label="Status" value={
                <select 
                  className="input-field w-full py-1 h-auto text-xs"
                  value={selectedLead.status}
                  onChange={(e) => {
                    const updated = { ...selectedLead, status: e.target.value };
                    DataManager.saveLead(updated);
                    setSelectedLead(updated);
                  }}
                >
                  {LEAD_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              } />
              <DetailItem label="Priority" value={
                <span className={cn(
                  "badge",
                  selectedLead.priority === 'Hot' ? "bg-danger" : selectedLead.priority === 'Warm' ? "bg-warning" : "bg-primary"
                )}>{selectedLead.priority}</span>
              } />
              <DetailItem label="Country" value={selectedLead.country} />
              <DetailItem label="Industry" value={selectedLead.industry} />
              <DetailItem label="Source" value={selectedLead.source} />
              <DetailItem label="Follow-up" value={selectedLead.followUpDate} />
            </div>

            <div className="space-y-6">
              <div className="card-secondary p-4 border-l-4 border-emerald-500">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2 flex justify-between">
                  <span>Incentive Details</span>
                  <span className="text-emerald-500">Active</span>
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Closing Amount</span>
                  <span className="text-xl font-bold text-white">
                    {selectedLead.closingAmount ? `${selectedLead.closingAmount} AED` : '---'}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-text-secondary uppercase font-bold tracking-widest">Earned Incentive</span>
                  <span className="text-2xl font-black text-emerald-500">
                    {selectedLead.closingAmount 
                      ? `${(parseFloat(selectedLead.closingAmount) * parseFloat(selectedLead.incentive || (selectedLead.source === 'Affiliate' ? '20' : '10')) / 100).toFixed(2)} AED` 
                      : '---'}
                  </span>
                </div>
              </div>

              <div className="card-secondary p-4">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Contact Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Phone size={14} className="text-primary" />
                    <span>{selectedLead.phone}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MessageCircle size={14} className="text-emerald-500" />
                    <span>{selectedLead.whatsapp}</span>
                    <a href={`https://wa.me/${selectedLead.whatsapp}`} target="_blank" className="text-primary hover:underline text-xs">(Message)</a>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Mail size={14} className="text-primary" />
                    <span>{selectedLead.email}</span>
                  </div>
                </div>
              </div>

              <div className="card-secondary p-4">
                <h3 className="text-sm font-bold uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Interaction Notes</h3>
                <p className="text-sm text-zinc-300 leading-relaxed italic">
                  "{selectedLead.notes || 'No initial notes.'}"
                </p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => { setIsDetailOpen(false); openEdit(selectedLead); }}
                  className="btn-primary flex-1 py-3 flex items-center justify-center gap-2"
                >
                  <Edit size={18} />
                  Edit Lead
                </button>
                <button 
                  onClick={() => handleDelete(selectedLead.id)}
                  className="btn-secondary flex-1 py-3 flex items-center justify-center gap-2 text-danger"
                >
                  <Trash2 size={18} />
                  Delete Lead
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DetailItem = ({ label, value }) => (
  <div>
    <label className="text-[10px] text-text-secondary uppercase font-bold tracking-widest block mb-1">{label}</label>
    <div className="text-sm font-medium">{value}</div>
  </div>
);

export default Leads;
