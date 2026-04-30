import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '@/services/api';
import { BarChart3, Loader, Users, Download, Activity, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { toast } from 'sonner';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface CategoryStat {
  category: string;
  count: number;
}

interface AdminStats {
  total_users: number;
  total_resources: number;
  total_downloads: number;
  pending_approvals: number;
  active_reports: number;
  category_stats: CategoryStat[];
  user_growth: { day: string; count: number }[];
  resource_growth: { day: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      toast.error('Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
        <Loader className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const categoryData = stats?.category_stats?.map((item: any) => ({
    name: item.category.charAt(0).toUpperCase() + item.category.slice(1).replace('_', ' '),
    count: item.count
  })) || [];

  const growthData = stats?.user_growth?.map((item: any, index: number) => ({
    day: item.day,
    users: item.count,
    resources: stats?.resource_growth?.[index]?.count || 0
  })) || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform statistics and resource management</p>
        </div>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            label="Total Users"
            value={stats.total_users}
            icon={<Users className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            label="Total Resources"
            value={stats.total_resources}
            icon={<BarChart3 className="w-5 h-5" />}
            color="primary"
          />
          <StatCard
            label="Total Downloads"
            value={stats.total_downloads}
            icon={<Download className="w-5 h-5" />}
            color="accent"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending_approvals}
            icon={<Activity className="w-5 h-5" />}
            color="secondary"
            highlight={stats.pending_approvals > 0}
          />
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Growth Trend (7 Days)</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" hide />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={3} dot={false} name="New Users" />
                <Line type="monotone" dataKey="resources" stroke="#82ca9d" strokeWidth={3} dot={false} name="New Resources" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Resource Distribution</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-xl p-8 shadow-sm mb-8">
        <h2 className="text-xl font-bold mb-6">Administrative Hub</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <ActionButton
            title="Review Pending"
            description={`${stats?.pending_approvals || 0} waiting`}
            to="/admin/pending"
            color="secondary"
          />
          <ActionButton
            title="Manage Users"
            description="Accounts & Access"
            to="/admin/users"
            color="accent"
          />
          <ActionButton
            title="View Analytics"
            description="Detailed Insights"
            to="/admin/analytics"
            color="primary"
          />
          <ActionButton
            title="Resource Hub"
            description="All Approved Content"
            to="/dashboard"
            color="primary"
          />
        </div>
      </div>

      {/* Responsibilities */}
      <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4" /> Admin Responsibilities
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm text-muted-foreground">
          <p>✓ Review and approve user-submitted resources</p>
          <p>✓ Reject resources that don't meet quality standards</p>
          <p>✓ Monitor platform activity and user engagement</p>
          <p>✓ Manage resource categories and metadata</p>
          <p>✓ Ensure community guidelines are followed</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  highlight = false,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  highlight?: boolean;
}) {
  const colorClasses: any = {
    primary: 'text-primary bg-primary/10',
    secondary: 'text-secondary bg-secondary/10',
    accent: 'text-accent bg-accent/10',
  };

  return (
    <div
      className={`bg-card border border-border rounded-xl p-6 transition-all hover:shadow-md ${
        highlight ? 'ring-2 ring-secondary shadow-lg shadow-secondary/5' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <p className="text-muted-foreground text-sm font-medium">{label}</p>
      </div>
      <p className="text-3xl font-bold">{value.toLocaleString()}</p>
    </div>
  );
}

function ActionButton({
  title,
  description,
  to,
  color,
}: {
  title: string;
  description: string;
  to: string;
  color: string;
}) {
  const colorClasses: any = {
    primary: 'hover:bg-primary/10 border-primary/20',
    secondary: 'hover:bg-secondary/10 border-secondary/20',
    accent: 'hover:bg-accent/10 border-accent/20',
  };

  return (
    <Link
      to={to}
      className={`block p-4 border rounded-lg transition-colors ${colorClasses[color]}`}
    >
      <h4 className="font-semibold mb-1">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
