import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { DataManager } from '../utils/dataManager';
import { format, isToday, isBefore, addDays } from 'date-fns';
import { 
  Phone, 
  MessageSquare, 
  Users, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Target, 
  Clock,
  ChevronRight,
  Plus
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { cn } from '../utils/cn';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    leadsContacted: 0,
    calls: 0,
    messages: 0,
    meetingsBooked: 0,
    followupsDone: 0
  });
  const [targets, setTargets] = useState(null);
  const [leads, setLeads] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [audits, setAudits] = useState([]);
  const [activityData, setActivityData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [leadsData, meetingsData, auditsData, targetsData, allActivity] = await Promise.all([
        DataManager.getLeads(),
        DataManager.getMeetings(),
        DataManager.getAudits(),
        DataManager.getTargets(),
        DataManager.getActivity()
      ]);

      setLeads(Array.isArray(leadsData) ? leadsData : []);
      setMeetings(Array.isArray(meetingsData) ? meetingsData : []);
      setAudits(Array.isArray(auditsData) ? auditsData : []);
      setTargets(targetsData || { monthlyMeetings: 0 });

      const today = format(new Date(), 'yyyy-MM-dd');
      const safeActivity = Array.isArray(allActivity) ? allActivity : [];
      const todayActivity = safeActivity.find(a => a.date === today) || {
        leadsContacted: 0, calls: 0, messages: 0, meetingsBooked: 0, followupsDone: 0
      };
      setStats(todayActivity);

      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = format(addDays(new Date(), -6 + i), 'yyyy-MM-dd');
        const act = allActivity.find(a => a.date === d) || { calls: 0, leadsContacted: 0, meetingsBooked: 0 };
        return {
          date: format(addDays(new Date(), -6 + i), 'MMM dd'),
          calls: act.calls,
          leads: act.leadsContacted,
          meetings: act.meetingsBooked
        };
      });
      setActivityData(last7Days);
    };
    fetchData();
  }, []);

  const incrementStat = async (key) => {
    const newStats = { ...stats, [key]: stats[key] + 1 };
    setStats(newStats);
    await DataManager.updateDailyStats(format(new Date(), 'yyyy-MM-dd'), newStats);
  };

  const followUps = leads.filter(l => {
    if (!l.followUpDate) return false;
    const date = l.followUpDate;
    const today = format(new Date(), 'yyyy-MM-dd');
    const threeDaysFromNow = format(addDays(new Date(), 3), 'yyyy-MM-dd');
    return date <= threeDaysFromNow && l.status !== 'won' && l.status !== 'lost';
  }).sort((a, b) => a.followUpDate.localeCompare(b.followUpDate));

  if (!targets) return <div className="p-10 text-center">Loading dashboard...</div>;

  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.priority === 'Hot').length;
  const meetingsThisWeek = DataManager.getMeetings().filter(m => {
    const d = new Date(m.date);
    const start = new Date();
    start.setHours(0,0,0,0);
    const end = addDays(start, 7);
    return d >= start && d <= end;
  }).length;
  const auditsThisMonth = DataManager.getAudits().filter(a => {
    return a.requestedDate && a.requestedDate.startsWith(format(new Date(), 'yyyy-MM'));
  }).length;

  return (
    <div className="space-y-8 fade-in">
      {/* Section A - DAILY SCORECARD */}
      {/* ... (existing scorecard) ... */}

      {user.role === 'manager' && (
        <div className="card border-primary/20 bg-primary/5">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-primary" size={20} />
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary">Manager View: Representative Activity</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border-r border-white/5">
              <div className="text-[10px] text-text-secondary uppercase font-bold">Total Active Days</div>
              <div className="text-2xl font-black text-white">{[...new Set(DataManager.getSessions().map(s => s.date))].length}</div>
            </div>
            <div className="text-center p-4 border-r border-white/5">
              <div className="text-[10px] text-text-secondary uppercase font-bold">Total Meetings Booked</div>
              <div className="text-2xl font-black text-white">{DataManager.getMeetings().length}</div>
            </div>
            <div className="text-center p-4">
              <div className="text-[10px] text-text-secondary uppercase font-bold">Pipeline Potential Incentive</div>
              <div className="text-2xl font-black text-emerald-500">
                {leads.reduce((acc, lead) => {
                  const rate = parseFloat(lead.incentive) || (lead.source === 'Affiliate' ? 20 : 10);
                  const amount = parseFloat(lead.closingAmount) || 0;
                  return acc + ((amount * rate) / 100);
                }, 0).toLocaleString()} AED
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ScorecardItem 
          label="Leads Contacted" 
          value={stats.leadsContacted} 
          icon={<Users size={20} />} 
          onIncrement={() => incrementStat('leadsContacted')}
        />
        <ScorecardItem 
          label="Calls Made" 
          value={stats.calls} 
          icon={<Phone size={20} />} 
          onIncrement={() => incrementStat('calls')}
        />
        <ScorecardItem 
          label="WhatsApp Sent" 
          value={stats.messages} 
          icon={<MessageSquare size={20} />} 
          onIncrement={() => incrementStat('messages')}
        />
        <ScorecardItem 
          label="Meetings Booked" 
          value={stats.meetingsBooked} 
          icon={<Calendar size={20} />} 
          onIncrement={() => incrementStat('meetingsBooked')}
        />
        <ScorecardItem 
          label="Follow-ups Done" 
          value={stats.followupsDone} 
          icon={<CheckCircle2 size={20} />} 
          onIncrement={() => incrementStat('followupsDone')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Section B - MONTHLY KPI PROGRESS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Target className="text-primary" size={20} />
                Monthly KPI Progress
              </h2>
              <span className="text-xs text-text-secondary font-medium uppercase tracking-widest">Target vs Achievement</span>
            </div>
            
            <div className="space-y-6">
              <ProgressBar 
                label="Leads Contacted" 
                current={leads.filter(l => l.dateReceived && l.dateReceived.startsWith(format(new Date(), 'yyyy-MM'))).length} 
                target={targets.monthlyMeetings * 5} // Mock logic for demo
              />
              <ProgressBar 
                label="Meetings Booked" 
                current={DataManager.getMeetings().filter(m => m.date && m.date.startsWith(format(new Date(), 'yyyy-MM'))).length} 
                target={targets.monthlyMeetings} 
              />
              <ProgressBar 
                label="Conversion Rate" 
                current={leads.length > 0 ? Math.round((DataManager.getMeetings().length / leads.length) * 100) : 0} 
                target={20}
                isPercent
              />
            </div>
          </div>

          {/* Section E - ACTIVITY CHART */}
          <div className="card">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-primary" size={20} />
              Last 7 Days Activity
            </h2>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#9ca3af" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '0' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Bar dataKey="calls" fill="#3b82f6" name="Calls" />
                  <Bar dataKey="leads" fill="#10b981" name="Leads" />
                  <Bar dataKey="meetings" fill="#f59e0b" name="Meetings" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Section C - TODAY'S FOLLOW-UPS */}
        <div className="space-y-6">
          <div className="card h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Clock className="text-warning" size={20} />
                Urgent Follow-ups
              </h2>
              <span className="badge bg-warning/20 text-warning">{followUps.length}</span>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-auto pr-2 custom-scrollbar">
              {followUps.length === 0 ? (
                <div className="text-center py-10 text-text-secondary italic text-sm">
                  No pending follow-ups for today.
                </div>
              ) : (
                followUps.map(lead => (
                  <FollowUpItem key={lead.id} lead={lead} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section D - QUICK STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickStat label="Pipeline Leads" value={totalLeads} />
        <QuickStat label="Hot Prospects" value={hotLeads} color="text-danger" />
        <QuickStat label="Meetings This Week" value={meetingsThisWeek} color="text-warning" />
        <QuickStat label="Audits Sent" value={auditsThisMonth} color="text-success" />
      </div>
    </div>
  );
};

const ScorecardItem = ({ label, value, icon, onIncrement }) => (
  <div className="bg-card-secondary border-t-2 border-primary p-5 relative group">
    <div className="flex items-center justify-between mb-2">
      <div className="text-primary">{icon}</div>
      <button 
        onClick={onIncrement}
        className="w-6 h-6 bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
      >
        <Plus size={14} />
      </button>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    <div className="text-xs text-text-secondary font-medium uppercase tracking-wider mt-1">{label}</div>
  </div>
);

const ProgressBar = ({ label, current, target, isPercent = false }) => {
  const percent = isPercent ? current : Math.min(Math.round((current / target) * 100), 100);
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-bold text-white">{label}</span>
        <span className="text-text-secondary">
          {isPercent ? `${current}%` : `${current} / ${target}`}
        </span>
      </div>
      <div className="h-2 bg-white/5 w-full">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

const FollowUpItem = ({ lead }) => {
  const today = format(new Date(), 'yyyy-MM-dd');
  const isOverdue = lead.followUpDate < today;
  const isTodayDate = lead.followUpDate === today;

  return (
    <div className={cn(
      "p-4 border-l-2",
      isOverdue ? "border-danger bg-danger/5" : isTodayDate ? "border-warning bg-warning/5" : "border-zinc-700 bg-white/5"
    )}>
      <div className="flex justify-between items-start mb-1">
        <h3 className="font-bold text-sm truncate pr-2">{lead.name}</h3>
        {isOverdue && <span className="badge bg-danger text-white text-[8px]">Overdue</span>}
      </div>
      <p className="text-[10px] text-text-secondary uppercase mb-2">{lead.company}</p>
      <p className="text-xs text-zinc-400 line-clamp-2 mb-3">"{lead.notes || 'No notes available'}"</p>
      <div className="flex gap-2">
        <button className="text-[10px] bg-primary/10 text-primary px-2 py-1 hover:bg-primary hover:text-white transition-colors font-bold uppercase">
          Mark Done
        </button>
        <button className="text-[10px] bg-zinc-800 text-white px-2 py-1 hover:bg-zinc-700 transition-colors font-bold uppercase">
          Reschedule
        </button>
      </div>
    </div>
  );
};

const QuickStat = ({ label, value, color = "text-white" }) => (
  <div className="card p-4 flex flex-col items-center justify-center text-center">
    <div className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-1">{label}</div>
    <div className={cn("text-3xl font-black", color)}>{value}</div>
  </div>
);

// cn helper removed, using import instead

export default Dashboard;
