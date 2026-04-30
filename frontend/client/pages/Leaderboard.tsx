import { useState, useEffect } from 'react';
import { usersAPI } from '@/services/api';
import { Trophy, Medal, Crown, Star, ArrowUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Leaderboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await usersAPI.getLeaderboard();
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
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

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Crown className="w-6 h-6 text-yellow-500 fill-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
      case 2: return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;
      default: return <span className="text-lg font-bold text-muted-foreground w-6 text-center">{index + 1}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 mb-6 shadow-inner">
          <Trophy className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Community Hall of Fame</h1>
        <p className="text-muted-foreground text-lg">Recognizing our top contributors and subject matter experts</p>
      </div>

      <div className="bg-card/30 backdrop-blur-xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-8 py-4 bg-muted/30 border-b border-border/40 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
          <div className="col-span-1">Rank</div>
          <div className="col-span-7">Contributor</div>
          <div className="col-span-4 text-right">Reputation</div>
        </div>

        <div className="divide-y divide-border/40">
          {users.map((user, index) => (
            <Link 
              to={`/profile/${user.id}`} 
              key={user.id}
              className="grid grid-cols-12 gap-4 px-8 py-6 hover:bg-muted/40 transition-all duration-300 items-center group"
            >
              <div className="col-span-1">
                {getRankIcon(index)}
              </div>
              
              <div className="col-span-7 flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-background shadow-lg">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  {index < 3 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-background rounded-full flex items-center justify-center shadow-md">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {user.full_name || user.username}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground font-medium">@{user.username}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full font-bold uppercase tracking-tighter text-muted-foreground">
                      {user.role}
                    </span>
                    {user.is_following && (
                      <span className="text-[10px] text-primary font-medium italic">Following</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className="text-2xl font-black text-foreground">{user.reputation_points}</span>
                  <div className="flex flex-col items-center">
                    <ArrowUp className="w-4 h-4 text-green-500" />
                    <span className="text-[8px] font-bold text-green-500 uppercase">Pts</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {users.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No rankings available yet. Start contributing to climb the leaderboard!
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
          <Star className="w-6 h-6 text-yellow-500 mb-3" />
          <h4 className="font-bold mb-1">Earn Points</h4>
          <p className="text-xs text-muted-foreground">Upload resources and get them approved to earn +10 points each.</p>
        </div>
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
          <Trophy className="w-6 h-6 text-primary mb-3" />
          <h4 className="font-bold mb-1">Fulfill Requests</h4>
          <p className="text-xs text-muted-foreground">Helping others earn you double points and community recognition.</p>
        </div>
        <div className="p-6 bg-card border border-border/50 rounded-2xl shadow-sm">
          <Medal className="w-6 h-6 text-secondary mb-3" />
          <h4 className="font-bold mb-1">Stay Active</h4>
          <p className="text-xs text-muted-foreground">The most active members get featured on the global hall of fame.</p>
        </div>
      </div>
    </div>
  );
}
