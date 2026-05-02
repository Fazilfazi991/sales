import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  Plus, 
  Search, 
  FileText, 
  CheckCircle2, 
  Clock, 
  Target,
  X,
  Trash2,
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { AUDIT_AREAS } from '../constants';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

const Audits = () => {
  const [audits, setAudits] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState(getInitialFormData());

  function getInitialFormData() {
    return {
      leadId: '',
      requestedDate: format(new Date(), 'yyyy-MM-dd'),
      completedDate: '',
      sentDate: '',
      areas: [],
      response: 'Neutral',
      followUpStatus: 'Pending',
      notes: ''
    };
  }

  const fetchData = async () => {
    const [auditsData, leadsData] = await Promise.all([
      DataManager.getAudits(),
      DataManager.getLeads()
    ]);
    setAudits(auditsData);
    setLeads(leadsData);
  };

  useEffect(() => {
    fetchData();
  }, [isModalOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    const lead = leads.find(l => l.id === formData.leadId);
    await DataManager.saveAudit({ 
      ...formData, 
      id: formData.id || Date.now().toString(),
      leadName: lead ? lead.name : 'Unknown Lead',
      company: lead ? lead.company : 'Unknown Company'
    });
    setIsModalOpen(false);
    setFormData(getInitialFormData());
    fetchData();
  };

  const toggleArea = (area) => {
    const areas = formData.areas.includes(area)
      ? formData.areas.filter(a => a !== area)
      : [...formData.areas, area];
    setFormData({ ...formData, areas });
  };

  const totalAudits = audits.length;
  const awaitingResponse = audits.filter(a => a.sentDate && a.response === 'Neutral').length;
  const positiveResponses = audits.filter(a => a.response === 'Positive' || a.response === 'Very Positive').length;
  const positiveRate = totalAudits > 0 ? Math.round((positiveResponses / totalAudits) * 100) : 0;
  
  // Mock conversion stat
  const convertedToMeetings = audits.filter(a => {
    const meeting = DataManager.getMeetings().find(m => m.leadId === a.leadId);
    return meeting !== undefined;
  }).length;

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Audit Tracker</h1>
          <p className="text-sm text-text-secondary">Monitor free audits and conversion rates</p>
        </div>
        <button 
          onClick={() => { setFormData(getInitialFormData()); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>New Audit Request</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard label="Total Audits Sent" value={totalAudits} icon={<FileText size={20} />} />
        <SummaryCard label="Awaiting Response" value={awaitingResponse} icon={<Clock size={20} />} color="text-warning" />
        <SummaryCard label="Positive Rate" value={`${positiveRate}%`} icon={<TrendingUp size={20} />} color="text-success" />
        <SummaryCard label="Converted to Meetings" value={convertedToMeetings} icon={<Target size={20} />} color="text-primary" />
      </div>

      {/* Audit List */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Lead / Company</th>
              <th>Requested</th>
              <th>Completed</th>
              <th>Audited Areas</th>
              <th>Prospect Response</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {audits.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-20 text-text-secondary italic">
                  No audits tracked yet.
                </td>
              </tr>
            ) : (
              audits.map(audit => (
                <tr key={audit.id}>
                  <td>
                    <div className="font-bold">{audit.leadName}</div>
                    <div className="text-[10px] text-text-secondary uppercase">{audit.company}</div>
                  </td>
                  <td className="text-xs">{audit.requestedDate}</td>
                  <td className="text-xs">{audit.completedDate || 'Pending'}</td>
                  <td>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {audit.areas.map(area => (
                        <span key={area} className="text-[8px] bg-zinc-800 text-zinc-400 px-1 py-0.5 uppercase">
                          {area}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={cn(
                      "badge",
                      audit.response.includes('Positive') ? "bg-emerald-500 text-white" : 
                      audit.response === 'Neutral' ? "bg-zinc-600 text-white" : "bg-red-500 text-white"
                    )}>
                      {audit.response}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {audit.followUpStatus === 'Done' ? (
                        <span className="text-success flex items-center gap-1 text-xs">
                          <CheckCircle2 size={12} /> Followed up
                        </span>
                      ) : (
                        <span className="text-warning flex items-center gap-1 text-xs">
                          <AlertCircle size={12} /> Pending
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Audit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-2xl bg-card border border-white/10 p-8 overflow-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Record Audit</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Linked Lead</label>
                  <select 
                    required
                    className="input-field w-full"
                    value={formData.leadId}
                    onChange={e => setFormData({...formData, leadId: e.target.value})}
                  >
                    <option value="">Select a lead...</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>{lead.name} ({lead.company})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Requested Date</label>
                  <input 
                    type="date" required className="input-field w-full"
                    value={formData.requestedDate}
                    onChange={e => setFormData({...formData, requestedDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Completed Date</label>
                  <input 
                    type="date" className="input-field w-full"
                    value={formData.completedDate}
                    onChange={e => setFormData({...formData, completedDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Prospect Response</label>
                  <select 
                    className="input-field w-full"
                    value={formData.response}
                    onChange={e => setFormData({...formData, response: e.target.value})}
                  >
                    <option>Very Positive</option>
                    <option>Positive</option>
                    <option>Neutral</option>
                    <option>Ghosted</option>
                    <option>Negative</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Audited Areas (Select all that apply)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AUDIT_AREAS.map(area => (
                    <button
                      key={area}
                      type="button"
                      onClick={() => toggleArea(area)}
                      className={cn(
                        "text-[10px] p-2 border transition-all uppercase font-bold text-left",
                        formData.areas.includes(area) 
                          ? "bg-primary border-primary text-white" 
                          : "border-white/10 text-zinc-500 hover:border-white/30"
                      )}
                    >
                      {area}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="label">Audit Notes</label>
                <textarea 
                  className="input-field w-full h-24 resize-none"
                  placeholder="Key findings or prospect feedback..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">
                  Save Audit Record
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
    </div>
  );
};

const SummaryCard = ({ label, value, icon, color = "text-white" }) => (
  <div className="card-secondary p-5 flex items-center gap-4">
    <div className="p-3 bg-white/5 text-primary">
      {icon}
    </div>
    <div>
      <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{label}</div>
      <div className={cn("text-2xl font-black", color)}>{value}</div>
    </div>
  </div>
);

export default Audits;
