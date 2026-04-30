import { useEffect, useState } from 'react';
import { adminAPI } from '@/services/api';
import { ResourceCard, Resource } from '@/components/ResourceCard';
import { CheckCircle2, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPending() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionInProgress, setActionInProgress] = useState<number | null>(null);

  useEffect(() => {
    fetchPendingResources();
  }, []);

  const fetchPendingResources = async () => {
    try {
      const response = await adminAPI.getPendingResources();
      setResources(response.data.results || response.data || []);
    } catch (error) {
      console.error('Failed to fetch pending resources:', error);
      toast.error('Failed to load pending resources');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (resourceId: number) => {
    setActionInProgress(resourceId);
    try {
      await adminAPI.approveResource(resourceId);
      toast.success('Resource approved successfully!');
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to approve resource';
      toast.error(message);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (resourceId: number) => {
    setActionInProgress(resourceId);
    try {
      await adminAPI.rejectResource(resourceId);
      toast.success('Resource rejected successfully!');
      setResources((prev) => prev.filter((r) => r.id !== resourceId));
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Failed to reject resource';
      toast.error(message);
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-secondary/20">
          <CheckCircle2 className="w-6 h-6 text-secondary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Pending Approvals</h1>
          <p className="text-muted-foreground">Review and approve user-submitted resources</p>
        </div>
      </div>

      {/* Count Badge */}
      <div className="mb-8 inline-block">
        <div className="bg-secondary/10 border border-secondary/20 rounded-full px-4 py-2">
          <span className="font-semibold text-secondary">{resources.length}</span>
          <span className="text-muted-foreground"> resource{resources.length !== 1 ? 's' : ''} pending review</span>
        </div>
      </div>

      {/* Resources Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : resources.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <div key={resource.id} className="relative">
              {actionInProgress === resource.id && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center z-10">
                  <Loader className="w-6 h-6 text-white animate-spin" />
                </div>
              )}
              <ResourceCard
                resource={resource}
                onApprove={handleApprove}
                onReject={handleReject}
                showActions={true}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <CheckCircle2 className="w-16 h-16 text-green-600/20 mx-auto mb-4" />
          <p className="text-muted-foreground text-lg font-semibold">All resources reviewed!</p>
          <p className="text-muted-foreground">There are no pending resources at the moment.</p>
        </div>
      )}

      {/* Info Box */}
      <div className="mt-12 bg-secondary/5 border border-secondary/20 rounded-lg p-6">
        <h3 className="font-semibold mb-3">Review Guidelines</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>✓ Check if the resource title is clear and descriptive</li>
          <li>✓ Verify the content matches the provided description</li>
          <li>✓ Ensure the resource is relevant to the selected category</li>
          <li>✓ Confirm the file format is appropriate and accessible</li>
          <li>✓ Reject resources that violate community guidelines or contain inappropriate content</li>
        </ul>
      </div>
    </div>
  );
}
