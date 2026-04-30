import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { usersAPI } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { ResourceCard } from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Loader2, UserPlus, UserMinus, Star, Edit3, Camera, Save, X, 
  CheckCircle2, TrendingUp, BarChart, PieChart, Info, Lock, Calendar 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart as ReBarChart, Bar, Cell
} from 'recharts';
import { requestsAPI } from "@/services/api";

export default function ProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const isOwnProfile = currentUser?.id === Number(id);
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["profile", id],
    queryFn: () => usersAPI.getProfile(Number(id)).then(res => res.data),
  });

  const { data: heatmapData, refetch: refetchHeatmap } = useQuery({
    queryKey: ["heatmap", id],
    queryFn: () => usersAPI.getUserHeatmap(Number(id)).then(res => res.data),
    enabled: !!id,
  });

  const toggleFollowMutation = useMutation({
    mutationFn: () => usersAPI.toggleFollow(Number(id)),
    onSuccess: (res) => {
      toast.success(res.data.message);
      refetch();
    },
    onError: () => {
      toast.error("Failed to update follow status.");
    }
  });

  const updateProfileMutation = useMutation({
    mutationFn: (formData: FormData) => usersAPI.updateProfile(formData),
    onSuccess: () => {
      toast.success("Profile updated!");
      setIsEditing(false);
      refetch();
    },
    onError: () => toast.error("Failed to update profile.")
  });

  const updatePasswordMutation = useMutation({
    mutationFn: () => usersAPI.updatePassword({ 
      old_password: oldPassword, 
      new_password: newPassword, 
      confirm_password: confirmPassword 
    }),
    onSuccess: () => {
      toast.success("Password updated successfully!");
      setIsPasswordModalOpen(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.old_password?.[0] || 
                  error.response?.data?.confirm_password?.[0] || 
                  "Failed to update password.";
      toast.error(msg);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const formData = new FormData();
    formData.append("bio", bio);
    if (avatarFile) formData.append("avatar", avatarFile);
    updateProfileMutation.mutate(formData);
  };

  const handleRemovePhoto = () => {
    if (window.confirm("Are you sure you want to remove your profile photo?")) {
      const formData = new FormData();
      formData.append("remove_avatar", "true");
      updateProfileMutation.mutate(formData);
      setAvatarPreview(null);
      setAvatarFile(null);
    }
  };

  useEffect(() => {
    if (profileData) {
      setBio(profileData.bio || "");
    }
  }, [profileData]);

  useEffect(() => {
    if (isOwnProfile) {
      fetchStats();
    }
  }, [isOwnProfile]);

  const fetchStats = async () => {
    try {
      setIsStatsLoading(true);
      const res = await requestsAPI.getMyStats();
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!profileData) {
    return <div className="p-8 text-center text-muted-foreground">User not found.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8 animate-in fade-in duration-500">
      <div className="bg-card rounded-xl p-8 border shadow-sm flex flex-col md:flex-row gap-6 items-center md:items-start text-center md:text-left relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary to-purple-500" />
        
        <div className="relative group">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-4 border-background shadow-md overflow-hidden">
            {avatarPreview || profileData.avatar ? (
              <img src={avatarPreview || profileData.avatar} alt={profileData.username} className="w-full h-full object-cover" />
            ) : (
              profileData.username.charAt(0).toUpperCase()
            )}
          </div>
          {isOwnProfile && isEditing && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <label className="cursor-pointer flex flex-col items-center">
                <Camera className="w-6 h-6 text-white mb-0.5" />
                <span className="text-[8px] text-white font-bold uppercase">Change</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
              {(avatarPreview || profileData.avatar) && (
                <button 
                  onClick={handleRemovePhoto}
                  className="mt-1 text-[8px] text-red-400 font-bold uppercase hover:text-red-300"
                >
                  Remove
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="flex-1 space-y-2">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold">{profileData.full_name || profileData.username}</h1>
              {profileData.is_verified && (
                <CheckCircle2 className="w-6 h-6 text-blue-500 fill-blue-500/10" />
              )}
            </div>
            {profileData.full_name && (
              <p className="text-muted-foreground font-medium">@{profileData.username}</p>
            )}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-secondary rounded-full text-xs font-bold text-secondary-foreground w-fit">
              <span className="opacity-60 text-[10px] uppercase tracking-wider">Member ID:</span>
              {profileData.member_id}
            </div>
          </div>
          {isEditing ? (
            <Textarea 
              value={bio} 
              onChange={(e) => setBio(e.target.value)} 
              placeholder="Tell us about yourself..." 
              className="mt-2"
            />
          ) : (
            <p className="text-muted-foreground whitespace-pre-wrap">{profileData.bio || "No bio yet."}</p>
          )}
          <p className="text-xs text-muted-foreground mt-1">{profileData.role === 'admin' ? 'Administrator' : 'Contributor'}</p>
          
          <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start">
            <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
              <Star className="w-4 h-4" />
              {profileData.reputation_points} Reputation Points
            </div>
            <div className="flex items-center gap-1.5 bg-secondary px-3 py-1 rounded-full text-sm font-medium">
              📚 {profileData.resources?.length || 0} Resources Uploaded
            </div>
          </div>
        </div>

        {isOwnProfile ? (
          <div className="flex gap-2 w-full md:w-auto">
            {isEditing ? (
              <>
                <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending} className="flex-1 md:flex-none">
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1 md:flex-none">
                  <X className="w-4 h-4 mr-2" /> Cancel
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)} className="flex-1 md:flex-none">
                <Edit3 className="w-4 h-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        ) : (
          <Button 
            onClick={() => toggleFollowMutation.mutate()}
            disabled={toggleFollowMutation.isPending}
            variant={profileData.is_following ? "outline" : "default"}
            className="w-full md:w-auto shadow-sm hover:shadow-md transition-all"
          >
            {toggleFollowMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : profileData.is_following ? (
              <UserMinus className="w-4 h-4 mr-2" />
            ) : (
              <UserPlus className="w-4 h-4 mr-2" />
            )}
            {profileData.is_following ? 'Unfollow' : 'Follow User'}
          </Button>
        )}
      </div>

      {isOwnProfile && (
        <div className="bg-card rounded-xl p-8 border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-xl">
              <Lock className="w-6 h-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-bold">Account Security</h3>
              <p className="text-sm text-muted-foreground">Keep your account secure by updating your password regularly.</p>
            </div>
          </div>
          <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">Change Password</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Update Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Current Password</label>
                  <Input 
                    type="password" 
                    value={oldPassword} 
                    onChange={(e) => setOldPassword(e.target.value)} 
                    placeholder="Enter current password"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">New Password</label>
                  <Input 
                    type="password" 
                    value={newPassword} 
                    onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Min. 8 characters"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm New Password</label>
                  <Input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Repeat new password"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                <Button 
                  onClick={() => updatePasswordMutation.mutate()} 
                  disabled={updatePasswordMutation.isPending}
                >
                  {updatePasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Update Password
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {isOwnProfile && stats && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-700">
          {/* Activity Heatmap */}
          <div className="bg-card p-6 rounded-2xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-bold">Contribution Heatmap</h3>
              </div>
              <p className="text-xs text-muted-foreground">Activity over the last year</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {(() => {
                const now = new Date();
                const days = [];
                for (let i = 364; i >= 0; i--) {
                  const d = new Date();
                  d.setDate(now.getDate() - i);
                  days.push(d.toISOString().split('T')[0]);
                }
                
                const dataMap = (heatmapData || []).reduce((acc: any, item: any) => {
                  acc[item.date] = item.count;
                  return acc;
                }, {});

                // Group into weeks
                const weeks = [];
                for (let i = 0; i < days.length; i += 7) {
                  weeks.push(days.slice(i, i + 7));
                }

                return weeks.map((week, wIndex) => (
                  <div key={wIndex} className="flex flex-col gap-1">
                    {week.map((date, dIndex) => {
                      const count = dataMap[date] || 0;
                      let intensity = 0;
                      if (count > 0 && count <= 2) intensity = 1;
                      else if (count > 2 && count <= 5) intensity = 2;
                      else if (count > 5) intensity = 3;
                      
                      const colors = ['bg-muted', 'bg-primary/30', 'bg-primary/60', 'bg-primary'];
                      return (
                        <div 
                          key={dIndex} 
                          className={`w-3 h-3 rounded-sm ${colors[intensity]} transition-all hover:ring-2 hover:ring-primary/50 cursor-pointer`}
                          title={`${date}: ${count} activities`}
                        />
                      );
                    })}
                  </div>
                ));
              })()}
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-[10px] text-muted-foreground">
              <span>Less</span>
              <div className="w-2.5 h-2.5 bg-muted rounded-sm" />
              <div className="w-2.5 h-2.5 bg-primary/30 rounded-sm" />
              <div className="w-2.5 h-2.5 bg-primary/60 rounded-sm" />
              <div className="w-2.5 h-2.5 bg-primary rounded-sm" />
              <span>More</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold tracking-tight">Growth & Impact</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4">
              <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Total Downloads</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black">{stats.total_downloads}</span>
                  <div className="p-1.5 bg-green-500/10 rounded-lg">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-2xl border shadow-sm space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60">Upload Success</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black">{Math.round((stats.approved_uploads / stats.total_uploads) * 100) || 0}%</span>
                  <div className="p-1.5 bg-blue-500/10 rounded-lg">
                    <BarChart className="w-4 h-4 text-blue-500" />
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Chart */}
            <div className="lg:col-span-2 bg-card p-6 rounded-2xl border shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold">Recent Upload Activity</h3>
                  <p className="text-xs text-muted-foreground">New resources added in the last 7 days</p>
                </div>
                <div className="p-2 bg-muted rounded-xl">
                  <PieChart className="w-5 h-5 text-muted-foreground" />
                </div>
              </div>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.upload_growth}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888820" />
                    <XAxis 
                      dataKey="day" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fontWeight: 600, fill: '#888' }} 
                    />
                    <YAxis hide />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))' }}
                      itemStyle={{ fontWeight: 700 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="count" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={4} 
                      dot={{ r: 4, fill: 'hsl(var(--primary))', strokeWidth: 2, stroke: 'white' }} 
                      activeDot={{ r: 6, strokeWidth: 0 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold tracking-tight">Portfolio</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profileData.resources?.length > 0 ? (
            profileData.resources.map((resource: any) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-lg bg-card/50">
              This user hasn't uploaded any resources yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
