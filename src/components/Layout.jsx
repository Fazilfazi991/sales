import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DataManager } from '../utils/dataManager';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  BarChart3, 
  Clock, 
  Settings, 
  LogOut, 
  Bell, 
  Menu, 
  X,
  ChevronRight,
  BadgeDollarSign
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../utils/cn';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notifications, setNotifications] = useState(0);
  const [profile, setProfile] = useState({ name: '', photo: null });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileData, leadsData] = await Promise.all([
          DataManager.getProfile(),
          DataManager.getLeads()
        ]);
        
        if (profileData) setProfile(profileData);
        
        if (Array.isArray(leadsData)) {
          const today = format(new Date(), 'yyyy-MM-dd');
          const overdueCount = leadsData.filter(l => l.followUpDate && l.followUpDate < today).length;
          setNotifications(overdueCount);
        }
      } catch (err) {
        console.warn('Layout data fetch failed', err);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Leads', path: '/leads', icon: Users },
    { name: 'Meetings', path: '/meetings', icon: Calendar },
    { name: 'Audits', path: '/audits', icon: ClipboardCheck },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
    { name: 'Attendance', path: '/attendance', icon: Clock },
    { name: 'Incentives', path: '/incentives', icon: BadgeDollarSign },
    ...(user.role === 'manager' ? [{ name: 'Settings', path: '/settings', icon: Settings }] : []),
  ];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-white/5 transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <span className={cn("text-xl font-bold tracking-tighter text-primary", !sidebarOpen && "lg:hidden")}>
              SALE<span className="text-white">X</span>
            </span>
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-white/5 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-3 transition-colors group",
                  isActive ? "bg-primary text-white" : "text-text-secondary hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} className={cn("shrink-0", sidebarOpen ? "" : "mx-auto")} />
                <span className={cn("font-medium transition-all duration-300", sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
                  {item.name}
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className={cn("flex items-center gap-3 p-2", !sidebarOpen && "justify-center")}>
              <div className="w-10 h-10 bg-zinc-800 shrink-0 flex items-center justify-center font-bold text-primary">
                {profile.photo ? (
                  <img src={profile.photo} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <div className={cn("flex-1 min-w-0 transition-all duration-300", sidebarOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden")}>
                <p className="text-sm font-bold truncate">{user.name}</p>
                <p className="text-xs text-text-secondary truncate capitalize">{user.role}</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-3 mt-4 text-danger hover:bg-danger/10 transition-colors",
                !sidebarOpen && "justify-center px-0"
              )}
            >
              <LogOut size={20} />
              <span className={cn("font-medium", sidebarOpen ? "block" : "hidden")}>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* TopBar */}
        <header className="h-16 bg-card border-b border-white/5 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-white/5 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-sm font-medium text-text-secondary hidden sm:block">
              Welcome back, <span className="text-white font-bold">{user.name}</span>
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex flex-col items-end leading-none">
              <span className="text-sm font-bold">{format(currentTime, 'hh:mm:ss a')}</span>
              <span className="text-[10px] text-text-secondary uppercase tracking-widest">{format(currentTime, 'EEEE, MMM dd')}</span>
            </div>
            
            <button className="relative p-2 hover:bg-white/5">
              <Bell size={20} />
              {notifications > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-[10px] flex items-center justify-center font-bold">
                  {notifications}
                </span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
