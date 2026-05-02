export const ROLES = {
  MANAGER: 'manager',
  REP: 'rep',
};

export const LEAD_STATUSES = [
  { id: 'new', label: 'New', color: 'bg-zinc-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-blue-500' },
  { id: 'interested', label: 'Interested', color: 'bg-purple-500' },
  { id: 'meeting-booked', label: 'Meeting Booked', color: 'bg-amber-500' },
  { id: 'audit-sent', label: 'Audit Sent', color: 'bg-orange-500' },
  { id: 'proposal-sent', label: 'Proposal Sent', color: 'bg-indigo-500' },
  { id: 'won', label: 'Won', color: 'bg-emerald-500' },
  { id: 'lost', label: 'Lost', color: 'bg-red-500' },
];

export const INDUSTRIES = [
  'Real Estate', 'F&B', 'Retail', 'Healthcare', 'Education', 'Hospitality', 'E-commerce', 'Other'
];

export const COUNTRIES = [
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Bahrain', 'Oman', 'Other'
];

export const SOURCES = [
  'Meta Ads', 'Google Ads', 'TikTok Ads', 'Organic', 'Referral', 'Walk-in', 'Affiliate', 'Other'
];

export const MEETING_TYPES = [
  'Phone Call', 'Video Call', 'In-Person'
];

export const MEETING_STATUSES = [
  { id: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' },
  { id: 'completed', label: 'Completed', color: 'bg-emerald-500' },
  { id: 'no-show', label: 'No-show', color: 'bg-red-500' },
  { id: 'rescheduled', label: 'Rescheduled', color: 'bg-amber-500' },
];

export const AUDIT_AREAS = [
  'Website', 'SEO', 'Competitor Research', 'Social Media', 'Content', 'Google Ads', 'Meta Ads', 'Google Business Profile'
];

export const INITIAL_TARGETS = {
  dailyCalls: 50,
  dailyLeads: 10,
  weeklyMeetings: 5,
  monthlyMeetings: 20,
  monthlyWins: 5,
};
