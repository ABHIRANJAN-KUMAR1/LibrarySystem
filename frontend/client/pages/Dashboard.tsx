import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { resourcesAPI, adminAPI } from '@/services/api';
import { ResourceCard, Resource } from '@/components/ResourceCard';
import { Search, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { EditResourceModal } from '@/components/EditResourceModal';

export default function Dashboard() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResources, setFilteredResources] = useState<Resource[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchResources();
  }, []);

  // Debounced Search Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        fetchResources(); // Reset to normal view when search is empty
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    let filtered = resources;
    if (showBookmarksOnly) {
      filtered = filtered.filter(r => r.isBookmarked);
    }
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredResources(filtered);
  }, [searchQuery, resources, showBookmarksOnly]);

  const fetchResources = async () => {
    try {
      // Fetch resources
      const response = await resourcesAPI.getApproved();
      let resData = response.data.results || response.data || [];
      
      // Fetch user's bookmarks to cross-reference
      try {
        const bookmarksRes = await resourcesAPI.getBookmarks();
        const bookmarkedIds = (bookmarksRes.data.results || bookmarksRes.data || []).map((r: any) => r.id);
        resData = resData.map((r: any) => ({...r, isBookmarked: bookmarkedIds.includes(r.id)}));
      } catch (err) {
        console.error('Failed to fetch bookmarks', err);
      }
      
      setResources(resData);
    } catch (error) {
      console.error('Failed to fetch resources:', error);
      toast.error('Failed to load resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim()) setIsSearching(true);
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const response = await resourcesAPI.search(searchQuery);
      const resData = response.data.results || response.data || [];
      setResources(resData);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleDownload = async (resourceId: number) => {
    try {
      const response = await resourcesAPI.download(resourceId);
      const fileUrl = response.data.file_url;
      
      // Trigger actual browser download
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', ''); // Force download attribute
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Download started!');
      fetchResources(); // Refresh to update download count
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download resource');
    }
  };

  const handleBookmarkToggle = async (resourceId: number) => {
    try {
      const response = await resourcesAPI.toggleBookmark(resourceId);
      toast.success(response.data.message);
      // Optimistically update
      setResources(resources.map(r => 
        r.id === resourceId ? { ...r, isBookmarked: !r.isBookmarked } : r
      ));
    } catch (error) {
      console.error('Bookmark toggle failed:', error);
      toast.error('Failed to update bookmark');
    }
  };

  const handleReport = async (resourceId: number) => {
    const reason = window.prompt("Why are you reporting this resource?");
    if (reason && reason.trim()) {
      try {
        const response = await resourcesAPI.reportResource(resourceId, reason);
        toast.success(response.data.message);
      } catch (error) {
        console.error('Report failed:', error);
        toast.error('Failed to report resource');
      }
    }
  };


  const handleDelete = async (resourceId: number) => {
    try {
      await adminAPI.deleteResource(resourceId);
      toast.success('Resource deleted successfully');
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete resource');
    }
  };


  const handleEdit = (resource: Resource) => {
    setEditingResource(resource);
    setIsEditModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Browse and download approved educational resources</p>
      </div>

      {/* Welcome Message */}
      {user && (
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 rounded-lg p-6 mb-8 flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold">Welcome, {user.full_name || user.username || user.email}!</p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-sm font-medium capitalize text-primary bg-primary/10 px-2 py-0.5 rounded">{user.role}</span>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded border">ID: {user.member_id}</span>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-primary/20 text-primary font-bold text-2xl px-4 py-2 rounded-lg">
              🏆 {user.reputation_points || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Reputation Points</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-8 flex gap-4">
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {isSearching ? (
              <Loader className="w-5 h-5 text-primary animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-muted-foreground" />
            )}
          </div>
          <input
            type="text"
            placeholder="Search resources by title, description, or category..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background transition-all"
          />
        </div>
        <button
          onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 border ${
            showBookmarksOnly 
              ? 'bg-yellow-500/20 text-yellow-700 border-yellow-500/50' 
              : 'bg-card text-foreground border-border hover:bg-muted'
          }`}
        >
          {showBookmarksOnly ? '★ Bookmarked' : '☆ All Resources'}
        </button>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredResources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              onDownload={handleDownload}
              onBookmark={handleBookmarkToggle}
              onReport={handleReport}
              onDelete={user?.role === 'admin' ? handleDelete : undefined}
              onEdit={user?.role === 'admin' ? handleEdit : undefined}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">
            {searchQuery ? 'No resources match your search' : 'No approved resources available yet'}
          </p>
        </div>
      )}

      <EditResourceModal
        resource={editingResource}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={fetchResources}
      />
    </div>
  );
}
