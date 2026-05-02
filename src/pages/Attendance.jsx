import React, { useState, useEffect } from 'react';
import { DataManager } from '../utils/dataManager';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Flame, 
  TrendingUp, 
  ChevronLeft, 
  ChevronRight,
  Monitor,
  LogOut,
  X
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  isToday
} from 'date-fns';
import { cn } from '../utils/cn';

const Attendance = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      const data = await DataManager.getSessions();
      setSessions(Array.isArray(data) ? data : []);
    };
    fetchSessions();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const getSessionForDay = (day) => {
    return sessions.filter(s => s.date === format(day, 'yyyy-MM-dd'));
  };

  const totalDaysWorked = [...new Set(sessions.map(s => s.date))].length;
  const avgHours = sessions.length > 0 
    ? (sessions.reduce((acc, s) => acc + parseFloat(s.hoursWorked || 0), 0) / sessions.length).toFixed(1)
    : 0;
  
  // Simple streak calculation
  const getStreak = () => {
    const dates = [...new Set(sessions.map(s => s.date))].sort().reverse();
    let streak = 0;
    let checkDate = new Date();
    
    for (let i = 0; i < dates.length; i++) {
      if (dates[i] === format(checkDate, 'yyyy-MM-dd')) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0 && dates[i] !== format(checkDate, 'yyyy-MM-dd')) {
        // If today not worked, check if yesterday was worked
        checkDate.setDate(checkDate.getDate() - 1);
        if (dates[i] === format(checkDate, 'yyyy-MM-dd')) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      } else {
        break;
      }
    }
    return streak;
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Attendance & Activity</h1>
          <p className="text-sm text-text-secondary">Monitor login history and daily performance</p>
        </div>
        <div className="flex items-center gap-2 bg-danger/10 text-danger px-4 py-2 border border-danger/20">
          <Flame size={20} className="fill-danger" />
          <span className="font-black text-xl">{getStreak()} Day Streak</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
              <div className="flex gap-2">
                <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-white/5 border border-white/10">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-white/5 border border-white/10">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/5">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="bg-[#1a1a1a] p-2 text-center text-[10px] font-bold text-text-secondary uppercase">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, idx) => {
                const daySessions = getSessionForDay(day);
                const hasWorked = daySessions.length > 0;
                const isCurrentMonth = isSameMonth(day, monthStart);

                return (
                  <div 
                    key={idx}
                    onClick={() => hasWorked && setSelectedDay(day)}
                    className={cn(
                      "min-h-[100px] p-2 bg-card transition-colors relative cursor-default",
                      !isCurrentMonth && "opacity-20",
                      hasWorked && "hover:bg-white/5 cursor-pointer"
                    )}
                  >
                    <span className={cn(
                      "text-xs font-bold",
                      isToday(day) ? "text-primary" : "text-text-secondary"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {hasWorked && (
                      <div className="mt-2 space-y-1">
                        <div className="w-full h-1 bg-success" title="Logged In" />
                        <div className="text-[8px] text-success font-bold uppercase">Active</div>
                        <div className="text-[10px] text-white font-medium">{daySessions[0].loginTime}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Stats & Selected Day */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <StatBox label="Total Days" value={totalDaysWorked} icon={<CalendarIcon size={16} />} />
            <StatBox label="Avg Hours" value={`${avgHours}h`} icon={<Clock size={16} />} />
            <StatBox label="Efficiency" value="84%" icon={<TrendingUp size={16} />} color="text-success" />
          </div>

          {selectedDay && (
            <div className="card border-primary/30 animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <h3 className="font-bold text-sm uppercase tracking-widest">{format(selectedDay, 'MMM dd, yyyy')}</h3>
                <button onClick={() => setSelectedDay(null)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>
              
              <div className="space-y-4">
                {getSessionForDay(selectedDay).map((s, i) => (
                  <div key={i} className="space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Login Time:</span>
                      <span className="font-bold text-white">{s.loginTime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Logout Time:</span>
                      <span className="font-bold text-white">{s.logoutTime || 'Active'}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Hours Worked:</span>
                      <span className="font-bold text-success">{s.hoursWorked || '0.0'}h</span>
                    </div>
                    
                    <div className="pt-2 border-t border-white/5">
                      <div className="text-[10px] text-text-secondary uppercase font-bold mb-2">Daily Stats</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-white/5 p-2 text-center">
                          <div className="text-[8px] text-zinc-500 uppercase">Calls</div>
                          <div className="text-sm font-bold">{s.stats?.calls || 0}</div>
                        </div>
                        <div className="bg-white/5 p-2 text-center">
                          <div className="text-[8px] text-zinc-500 uppercase">Meetings</div>
                          <div className="text-sm font-bold">{s.stats?.meetingsBooked || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Table */}
      <div className="card">
        <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2">
          <Monitor size={16} className="text-primary" />
          Recent Login Sessions
        </h2>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Login Time</th>
                <th>Logout Time</th>
                <th>Duration</th>
                <th>Daily Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice().reverse().map((session, idx) => (
                <tr key={idx}>
                  <td className="font-bold">{session.date}</td>
                  <td className="text-success text-xs font-medium">{session.loginTime}</td>
                  <td className="text-danger text-xs font-medium">{session.logoutTime || '---'}</td>
                  <td>{session.hoursWorked || '0.0'} hours</td>
                  <td>
                    <div className="flex gap-2">
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 font-bold">{session.stats?.calls || 0}C</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-1.5 py-0.5 font-bold">{session.stats?.meetingsBooked || 0}M</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, icon, color = "text-white" }) => (
  <div className="card-secondary p-4 flex items-center justify-between">
    <div>
      <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{label}</div>
      <div className={cn("text-xl font-black", color)}>{value}</div>
    </div>
    <div className="text-zinc-700">{icon}</div>
  </div>
);

export default Attendance;
