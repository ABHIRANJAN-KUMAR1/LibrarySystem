import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { 
  BarChart3, TrendingUp, Users, Download, Loader2, 
  PieChart as PieChartIcon, Activity
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminAnalytics() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await adminAPI.getAnalytics();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      toast.error('Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  // Format data for Recharts
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
      <div className="mb-8 flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
          <BarChart3 className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Library Analytics</h1>
          <p className="text-muted-foreground">Monitor platform growth and engagement</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard 
          icon={<Users className="w-6 h-6" />} 
          label="Total Users" 
          value={stats?.total_users || 0} 
        />
        <StatCard 
          icon={<BarChart3 className="w-6 h-6" />} 
          label="Total Resources" 
          value={stats?.total_resources || 0} 
        />
        <StatCard 
          icon={<Download className="w-6 h-6" />} 
          label="Total Downloads" 
          value={stats?.total_downloads || 0} 
        />
        <StatCard 
          icon={<Activity className="w-6 h-6" />} 
          label="Pending Approvals" 
          value={stats?.pending_approvals || 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution (Bar Chart) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Resources by Category</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Trend (Line Chart) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">7-Day Growth Trend</h3>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" strokeWidth={2} name="New Users" />
                <Line type="monotone" dataKey="resources" stroke="#82ca9d" strokeWidth={2} name="New Resources" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart (Engagement) */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <PieChartIcon className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Category Share</h3>
          </div>
          <div className="h-[400px] flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {categoryData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg text-primary">
          {icon}
        </div>
        <div>
          <h3 className="text-muted-foreground text-sm font-medium">{label}</h3>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </div>
  );
}
