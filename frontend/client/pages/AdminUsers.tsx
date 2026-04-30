import { useState, useEffect } from 'react';
import { adminAPI } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { Users as UsersIcon, Trash2, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: number;
  username: string;
  full_name: string;
  member_id: string;
  email: string;
  role: 'admin' | 'user';
  reputation_points: number;
  date_joined: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number, username: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${username}"? All their data will be removed.`)) {
      return;
    }

    setDeletingId(userId);
    try {
      await adminAPI.deleteUser(userId);
      toast.success(`User "${username}" deleted successfully`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to delete user';
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20">
          <UsersIcon className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">View and manage all registered accounts</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-card border border-border rounded-xl shadow-lg overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="px-6 py-4 font-semibold">User</th>
                  <th className="px-6 py-4 font-semibold">Email</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold text-center">Reputation</th>
                  <th className="px-6 py-4 font-semibold">Joined</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border shadow-sm">
                          {(user.full_name || user.username).charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{user.full_name || user.username}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-muted-foreground font-medium">@{user.username}</span>
                            <span className="text-[9px] bg-secondary px-1.5 rounded text-secondary-foreground font-bold">{user.member_id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.role === 'admin' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role === 'admin' ? <Shield className="w-3 h-3" /> : <UserIcon className="w-3 h-3" />}
                        {user.role.toUpperCase()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="font-semibold text-primary">{user.reputation_points}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.date_joined).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {currentUser?.id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(user.id, user.username)}
                          disabled={deletingId === user.id}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete User"
                        >
                          {deletingId === user.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && (
              <div className="text-center py-20 text-muted-foreground">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
