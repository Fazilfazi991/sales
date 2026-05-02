import { INITIAL_TARGETS } from '../constants';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const DataManager = {
  // Leads
  getLeads: async () => {
    try {
      const res = await fetch(`${API_URL}/leads`);
      return await res.json();
    } catch (err) {
      console.warn('Falling back to local storage', err);
      return JSON.parse(localStorage.getItem('salespro_leads') || '[]');
    }
  },
  saveLead: async (lead) => {
    try {
      const res = await fetch(`${API_URL}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead)
      });
      return await res.json();
    } catch (err) {
      console.error('Failed to save to database', err);
      // Still update local storage for redundancy
      const leads = JSON.parse(localStorage.getItem('salespro_leads') || '[]');
      const index = leads.findIndex(l => l.id === lead.id);
      if (index > -1) leads[index] = lead; else leads.push(lead);
      localStorage.setItem('salespro_leads', JSON.stringify(leads));
      return lead;
    }
  },
  deleteLead: async (id) => {
    try {
      await fetch(`${API_URL}/leads/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete from database', err);
      const leads = JSON.parse(localStorage.getItem('salespro_leads') || '[]').filter(l => l.id !== id);
      localStorage.setItem('salespro_leads', JSON.stringify(leads));
    }
  },

  // Meetings
  getMeetings: async () => {
    try {
      const res = await fetch(`${API_URL}/meetings`);
      return await res.json();
    } catch (err) {
      return JSON.parse(localStorage.getItem('salespro_meetings') || '[]');
    }
  },
  saveMeeting: async (meeting) => {
    try {
      const res = await fetch(`${API_URL}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(meeting)
      });
      return await res.json();
    } catch (err) {
      const meetings = JSON.parse(localStorage.getItem('salespro_meetings') || '[]');
      const index = meetings.findIndex(m => m.id === meeting.id);
      if (index > -1) meetings[index] = meeting; else meetings.push(meeting);
      localStorage.setItem('salespro_meetings', JSON.stringify(meetings));
      return meeting;
    }
  },

  // Audits
  getAudits: async () => {
    try {
      const res = await fetch(`${API_URL}/audits`);
      return await res.json();
    } catch (err) {
      return JSON.parse(localStorage.getItem('salespro_audits') || '[]');
    }
  },
  saveAudit: async (audit) => {
    try {
      const res = await fetch(`${API_URL}/audits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(audit)
      });
      return await res.json();
    } catch (err) {
      const audits = JSON.parse(localStorage.getItem('salespro_audits') || '[]');
      const index = audits.findIndex(a => a.id === audit.id);
      if (index > -1) audits[index] = audit; else audits.push(audit);
      localStorage.setItem('salespro_audits', JSON.stringify(audits));
      return audit;
    }
  },

  // Activity
  getActivity: async () => {
    try {
      const res = await fetch(`${API_URL}/activity`);
      return await res.json();
    } catch (err) {
      return JSON.parse(localStorage.getItem('salespro_daily_activity') || '[]');
    }
  },
  updateDailyStats: async (date, stats) => {
    try {
      await fetch(`${API_URL}/activity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date, ...stats })
      });
    } catch (err) {
      const activity = JSON.parse(localStorage.getItem('salespro_daily_activity') || '[]');
      const index = activity.findIndex(a => a.date === date);
      if (index > -1) activity[index] = { ...activity[index], ...stats }; else activity.push({ date, ...stats });
      localStorage.setItem('salespro_daily_activity', JSON.stringify(activity));
    }
  },

  // Targets
  getTargets: async () => {
    try {
      const res = await fetch(`${API_URL}/targets`);
      const data = await res.json();
      return data || INITIAL_TARGETS;
    } catch (err) {
      return JSON.parse(localStorage.getItem('salespro_targets')) || INITIAL_TARGETS;
    }
  },
  saveTargets: async (targets) => {
    try {
      await fetch(`${API_URL}/targets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(targets)
      });
    } catch (err) {
      localStorage.setItem('salespro_targets', JSON.stringify(targets));
    }
  },

  // Profile
  getProfile: async () => {
    try {
      const res = await fetch(`${API_URL}/profile`);
      return await res.json();
    } catch (err) {
      return JSON.parse(localStorage.getItem('salespro_rep_profile')) || { name: 'Sarah Jenkins', photo: null };
    }
  },
  saveProfile: async (profile) => {
    try {
      await fetch(`${API_URL}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
    } catch (err) {
      localStorage.setItem('salespro_rep_profile', JSON.stringify(profile));
    }
  },

  // Sessions (Keeping in LocalStorage for now as it's more temporary)
  getSessions: () => JSON.parse(localStorage.getItem('salespro_login_sessions') || '[]'),
  addSession: (session) => {
    const sessions = DataManager.getSessions();
    sessions.push(session);
    localStorage.setItem('salespro_login_sessions', JSON.stringify(sessions));
  },
  updateLastSession: (logoutTime, hoursWorked) => {
    const sessions = DataManager.getSessions();
    if (sessions.length > 0) {
      sessions[sessions.length - 1].logoutTime = logoutTime;
      sessions[sessions.length - 1].hoursWorked = hoursWorked;
      localStorage.setItem('salespro_login_sessions', JSON.stringify(sessions));
    }
  },

  resetAll: () => {
    localStorage.clear();
  },
  exportData: async () => {
    const data = {
      leads: await DataManager.getLeads(),
      meetings: await DataManager.getMeetings(),
      audits: await DataManager.getAudits(),
      activity: await DataManager.getActivity(),
      targets: await DataManager.getTargets(),
      profile: await DataManager.getProfile(),
    };
    return JSON.stringify(data, null, 2);
  }
};
