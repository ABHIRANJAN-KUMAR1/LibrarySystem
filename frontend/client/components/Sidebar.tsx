import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Upload,
  BarChart3,
  CheckCircle2,
  BookOpen,
  LogOut,
  FolderOpen,
  HelpCircle,
  Menu,
  X,
  User,
  Users,
  LayoutDashboard,
  Settings,
  Trophy
} from 'lucide-react';
import { useState } from 'react';

export function Sidebar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false); // For mobile
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop hide/show

  const isActive = (path: string) => location.pathname === path;

  const sections = [
    {
      title: "Library",
      links: [
        { path: '/', label: 'Home', icon: Home },
        { path: '/dashboard', label: 'Explore', icon: BookOpen },
        { path: '/collections', label: 'Collections', icon: FolderOpen },
        { path: '/requests', label: 'Requests', icon: HelpCircle },
        { path: '/leaderboard', label: 'Leaderboard', icon: Trophy },
      ]
    },
    ...(user ? [{
      title: "Account",
      links: [
        { path: `/profile/${user.id}`, label: 'My Profile', icon: User },
        { path: '/upload', label: 'Upload New', icon: Upload },
      ]
    }] : []),
    ...(user?.role === 'admin' ? [{
      title: "Administration",
      links: [
        { path: '/admin/dashboard', label: 'Analytics', icon: BarChart3 },
        { path: '/admin/pending', label: 'Review Queue', icon: CheckCircle2 },
        { path: '/admin/users', label: 'Users', icon: Users },
      ]
    }] : []),
  ];

  const NavLink = ({ path, label, icon: Icon }: { path: string; label: string; icon: any }) => (
    <Link
      to={path}
      onClick={() => setIsOpen(false)}
      className={`group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 ${
        isActive(path)
          ? 'bg-primary/15 text-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      }`}
    >
      {isActive(path) && (
        <span className="absolute left-0 w-1 h-6 bg-primary rounded-r-full" />
      )}
      <Icon className={`w-5 h-5 transition-transform duration-300 ${isActive(path) ? 'scale-110' : 'group-hover:scale-110'}`} />
      <span className="font-medium text-sm">{label}</span>
    </Link>
  );

  return (
    <>
      {/* Mobile & Desktop Toggle Button - Glassmorphism */}
      <button
        onClick={() => {
          if (window.innerWidth >= 1024) {
            setIsCollapsed(!isCollapsed);
          } else {
            setIsOpen(!isOpen);
          }
        }}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-xl bg-background/80 backdrop-blur-md border border-border shadow-xl text-foreground hover:scale-105 transition-all active:scale-95"
      >
        {window.innerWidth < 1024 ? (
          isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />
        ) : (
          isCollapsed ? <Menu className="w-6 h-6" /> : <X className="w-6 h-6" />
        )}
      </button>

      {/* Sidebar - Premium Aesthetic */}
      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-card/40 backdrop-blur-xl border-r border-border/50 shadow-[20px_0_40px_rgba(0,0,0,0.02)] transition-all duration-500 z-40 ${
          window.innerWidth >= 1024 
            ? (isCollapsed ? '-translate-x-full opacity-0 pointer-events-none' : 'translate-x-0 opacity-100')
            : (isOpen ? 'translate-x-0' : '-translate-x-full')
        }`}
      >
        <div className="flex flex-col h-full p-6">
          {/* Brand Logo Section */}
          <div className="mb-10 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <LayoutDashboard className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                EduLib<span className="text-primary text-2xl leading-none">.</span>
              </h1>
              <div className="h-1 w-8 bg-primary/40 rounded-full mt-0.5" />
            </div>
          </div>

          {/* Navigation with Grouping */}
          <nav className="flex-1 space-y-8 overflow-y-auto no-scrollbar pr-2">
            {sections.map((section, idx) => (
              <div key={idx} className="space-y-2">
                <h2 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                  {section.title}
                </h2>
                <div className="space-y-1">
                  {section.links.map((link) => (
                    <NavLink key={link.path} {...link} />
                  ))}
                </div>
              </div>
            ))}
          </nav>

          {/* User Profile Card - Premium UI */}
          <div className="mt-auto pt-6 border-t border-border/50">
            {user && (
              <div className="mb-4 px-2 py-3 rounded-2xl bg-muted/30 border border-border/40 backdrop-blur-sm group">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-background shadow-inner">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold">
                          {(user.full_name || user.username || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-card rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate text-foreground">{user.full_name || user.username}</p>
                    <div className="flex items-center gap-1.5">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{user.role}</p>
                      <span className="text-[8px] bg-secondary/50 px-1 rounded font-bold text-secondary-foreground">{user.member_id}</span>
                    </div>
                  </div>
                  <button onClick={logout} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-[10px] text-center text-muted-foreground/40 font-medium">
              v1.2.0 • Premium Dashboard
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay - Subtle Blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-30 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
      {/* Main Content & Header Margin Adjustment */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1024px) {
          main { margin-left: ${isCollapsed ? '0' : '288px'}; transition: margin-left 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
          .header-container { left: ${isCollapsed ? '0' : '288px'}; transition: left 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
        }
      `}} />
    </>
  );
}
