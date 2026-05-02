import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  Plus, 
  Search, 
  Calendar, 
  Clock, 
  MapPin, 
  Video, 
  Phone,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  ChevronRight
} from 'lucide-react';
import { MEETING_TYPES, MEETING_STATUSES } from '../constants';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [formData, setFormData] = useState(getInitialFormData());
  const [outcomeData, setOutcomeData] = useState({
    outcome: 'Needs Follow-up',
    notes: '',
    nextStep: '',
    nextFollowUp: format(new Date(), 'yyyy-MM-dd')
  });

  function getInitialFormData() {
    return {
      leadId: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '10:00',
      type: 'Video Call',
      location: '',
      notes: '',
      status: 'scheduled'
    };
  }

  const fetchData = async () => {
    const [meetingsData, leadsData] = await Promise.all([
      DataManager.getMeetings(),
      DataManager.getLeads()
    ]);
    setMeetings(meetingsData);
    setLeads(leadsData);
  };

  useEffect(() => {
    fetchData();
  }, [isModalOpen, isOutcomeModalOpen]);

  const handleSave = async (e) => {
    e.preventDefault();
    const lead = leads.find(l => l.id === formData.leadId);
    await DataManager.saveMeeting({ 
      ...formData, 
      id: formData.id || Date.now().toString(),
      leadName: lead ? lead.name : 'Unknown Lead',
      company: lead ? lead.company : 'Unknown Company'
    });
    setIsModalOpen(false);
    setFormData(getInitialFormData());
    fetchData();
  };

  const handleComplete = (meeting) => {
    setSelectedMeeting(meeting);
    setIsOutcomeModalOpen(true);
  };

  const saveOutcome = async (e) => {
    e.preventDefault();
    const updated = { ...selectedMeeting, ...outcomeData, status: 'completed' };
    await DataManager.saveMeeting(updated);
    
    // Update linked lead follow-up date if provided
    if (outcomeData.nextFollowUp) {
      const lead = leads.find(l => l.id === selectedMeeting.leadId);
      if (lead) {
        await DataManager.saveLead({ ...lead, followUpDate: outcomeData.nextFollowUp });
      }
    }

    setIsOutcomeModalOpen(false);
    fetchData();
  };

  const getStatusBadge = (status) => {
    const s = MEETING_STATUSES.find(ms => ms.id === status);
    return (
      <span className={cn("badge text-white", s?.color || "bg-zinc-600")}>
        {s?.label || status}
      </span>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video Call': return <Video size={14} />;
      case 'Phone Call': return <Phone size={14} />;
      case 'In-Person': return <MapPin size={14} />;
      default: return <Calendar size={14} />;
    }
  };

  const thisWeeksMeetings = meetings.filter(m => {
    const d = new Date(m.date);
    const now = new Date();
    const weekEnd = new Date();
    weekEnd.setDate(now.getDate() + 7);
    return d >= now && d <= weekEnd && m.status === 'scheduled';
  }).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Meetings Tracker</h1>
          <p className="text-sm text-text-secondary">Schedule and manage prospect interactions</p>
        </div>
        <button 
          onClick={() => { setFormData(getInitialFormData()); setIsModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Add Meeting</span>
        </button>
      </div>

      {/* This Week Highlight */}
      {thisWeeksMeetings.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-primary">Scheduled for This Week</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {thisWeeksMeetings.map(meeting => (
              <div key={meeting.id} className="card-secondary border-l-2 border-primary p-4 hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[10px] text-text-secondary font-bold uppercase">{meeting.date} @ {meeting.time}</div>
                  <div className="text-primary">{getTypeIcon(meeting.type)}</div>
                </div>
                <div className="font-bold text-sm mb-1">{meeting.leadName}</div>
                <div className="text-[10px] text-text-secondary truncate mb-4">{meeting.company}</div>
                <button 
                  onClick={() => handleComplete(meeting)}
                  className="w-full py-2 bg-primary/10 text-primary text-[10px] font-bold uppercase hover:bg-primary hover:text-white transition-colors"
                >
                  Mark Completed
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Meeting List */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Meeting Info</th>
              <th>Lead / Company</th>
              <th>Type</th>
              <th>Status</th>
              <th>Outcome</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-20 text-text-secondary italic">
                  No meetings scheduled yet.
                </td>
              </tr>
            ) : (
              meetings.map(meeting => (
                <tr key={meeting.id}>
                  <td>
                    <div className="flex flex-col">
                      <span className="font-bold">{meeting.date}</span>
                      <span className="text-xs text-text-secondary">{meeting.time}</span>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold">{meeting.leadName}</div>
                    <div className="text-[10px] text-text-secondary">{meeting.company}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-xs">
                      {getTypeIcon(meeting.type)}
                      {meeting.type}
                    </div>
                  </td>
                  <td>{getStatusBadge(meeting.status)}</td>
                  <td>
                    <span className="text-xs italic text-zinc-400">
                      {meeting.outcome || (meeting.status === 'scheduled' ? 'Pending' : 'No outcome set')}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {meeting.status === 'scheduled' ? (
                        <button 
                          onClick={() => handleComplete(meeting)}
                          className="p-1.5 hover:bg-emerald-500/10 text-emerald-500"
                          title="Complete"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      ) : (
                        <button className="p-1.5 hover:bg-white/5 text-zinc-500">
                          <MoreVertical size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Meeting Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-lg bg-card border border-white/10 p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">Schedule Meeting</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input 
                    type="date" required className="input-field w-full"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input 
                    type="time" required className="input-field w-full"
                    value={formData.time}
                    onChange={e => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select 
                    className="input-field w-full"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    {MEETING_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Status</label>
                  <select 
                    className="input-field w-full"
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                  >
                    {MEETING_STATUSES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Location / Link</label>
                <input 
                  type="text" className="input-field w-full"
                  placeholder="Zoom link or Physical address"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
              </div>

              <div>
                <label className="label">Notes Before Meeting</label>
                <textarea 
                  className="input-field w-full h-24 resize-none"
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">
                  Schedule Meeting
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

      {/* Outcome Modal */}
      {isOutcomeModalOpen && selectedMeeting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="w-full max-w-lg bg-card border border-white/10 p-8 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold">Meeting Outcome</h2>
                <p className="text-xs text-text-secondary uppercase tracking-widest mt-1">
                  {selectedMeeting.leadName} | {selectedMeeting.company}
                </p>
              </div>
              <button onClick={() => setIsOutcomeModalOpen(false)} className="p-2 hover:bg-white/5">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={saveOutcome} className="space-y-6">
              <div>
                <label className="label">Final Outcome</label>
                <select 
                  className="input-field w-full"
                  value={outcomeData.outcome}
                  onChange={e => setOutcomeData({...outcomeData, outcome: e.target.value})}
                >
                  <option>Very Interested</option>
                  <option>Needs Follow-up</option>
                  <option>Proposal Requested</option>
                  <option>Not Interested</option>
                  <option>Lost</option>
                </select>
              </div>

              <div>
                <label className="label">Post-Meeting Notes</label>
                <textarea 
                  className="input-field w-full h-32 resize-none"
                  placeholder="What was discussed? Key pain points?"
                  value={outcomeData.notes}
                  onChange={e => setOutcomeData({...outcomeData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Next Step</label>
                  <input 
                    type="text" className="input-field w-full"
                    placeholder="e.g. Send Proposal"
                    value={outcomeData.nextStep}
                    onChange={e => setOutcomeData({...outcomeData, nextStep: e.target.value})}
                  />
                </div>
                <div>
                  <label className="label">Next Follow-up Date</label>
                  <input 
                    type="date" className="input-field w-full"
                    value={outcomeData.nextFollowUp}
                    onChange={e => setOutcomeData({...outcomeData, nextFollowUp: e.target.value})}
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button type="submit" className="btn-primary flex-1 py-3">
                  Save Outcome
                </button>
                <button 
                  type="button" 
                  onClick={() => setIsOutcomeModalOpen(false)}
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

export default Meetings;
