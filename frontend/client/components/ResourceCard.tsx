import { Link } from 'react-router-dom';
import { apiClient } from '@/services/api';
import { Download, User, Calendar, Eye, Flag, Trash2, Pencil, CheckCircle2, ShieldCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  uploaded_by: {
    id: number;
    username: string;
    role: string;
    reputation_points?: number;
    bio?: string;
    avatar?: string;
    is_verified?: boolean;
  };
  created_at: string;
  download_count: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by?: {
    id: number;
    username: string;
    role: string;
  };
  approved_at?: string;
  tags?: { id: number; name: string }[];
  average_rating?: number;
  reviews_count?: number;
  isBookmarked?: boolean;
  file_url?: string;
  file_extension: string;
}

interface ResourceCardProps {
  resource: Resource;
  onDownload?: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onBookmark?: (id: number) => void;
  onReport?: (id: number) => void;
  onDelete?: (id: number) => void;
  onEdit?: (resource: Resource) => void;
  showActions?: boolean;
}

export function ResourceCard({
  resource,
  onDownload,
  onApprove,
  onReject,
  onBookmark,
  onReport,
  onDelete,
  onEdit,
  showActions = false,
}: ResourceCardProps) {
  const getStatusBadge = () => {
    const baseClass = 'inline-block px-3 py-1 rounded-full text-xs font-semibold';
    switch (resource.status) {
      case 'PENDING':
        return (
          <span className={`${baseClass} status-pending`}>
            ⏳ Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className={`${baseClass} status-approved`}>
            ✓ Approved
          </span>
        );
      case 'REJECTED':
        return (
          <span className={`${baseClass} status-rejected`}>
            ✕ Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full">
      {/* Header with status */}
      <div className="p-4 pb-0 flex items-start justify-between gap-2">
        <div className="flex-1">
          <Link to={`/resources/${resource.id}`}>
            <h3 className="font-bold text-lg text-card-foreground line-clamp-2 hover:text-primary transition-colors">
              {resource.title}
            </h3>
          </Link>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mt-2">
            <span className="bg-primary/10 text-primary px-2 py-1 rounded">
              {resource.category}
            </span>
            {resource.tags && resource.tags.map(tag => (
              <span key={tag.id} className="bg-secondary/10 text-secondary px-2 py-1 rounded">
                #{tag.name}
              </span>
            ))}
          </div>
        </div>
        {onBookmark && (
          <button 
            onClick={() => onBookmark(resource.id)}
            className={`p-2 rounded-full transition-colors ${resource.isBookmarked ? 'bg-yellow-500/20 text-yellow-600' : 'bg-muted text-muted-foreground hover:bg-muted/80'}`}
            title="Bookmark"
          >
            {resource.isBookmarked ? '★' : '☆'}
          </button>
        )}
      </div>

      {/* Status Badge */}
      <div className="px-4 pt-3">
        {getStatusBadge()}
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground px-4 pt-3 line-clamp-3">
        {resource.description}
      </p>

      {/* Meta Information */}
      <div className="px-4 pt-3 text-xs text-muted-foreground space-y-1">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5" />
          <Link to={`/profile/${resource.uploaded_by.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
            By {resource.uploaded_by.full_name || resource.uploaded_by.username}
            {resource.uploaded_by.is_verified && (
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/10" />
            )}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formatDistanceToNow(new Date(resource.created_at), { addSuffix: true })}</span>
        </div>
        {resource.status === 'APPROVED' && resource.approved_by && (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-md w-fit">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified by {resource.approved_by.full_name || resource.approved_by.username}</span>
          </div>
        )}
        {resource.status === 'APPROVED' && (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <Download className="w-3.5 h-3.5" />
              <span>{resource.download_count} downloads</span>
            </div>
            {resource.average_rating !== undefined && (
              <div className="flex items-center gap-1 text-yellow-600 font-medium">
                ★ <span>{resource.average_rating.toFixed(1)}</span>
                <span className="text-muted-foreground font-normal">({resource.reviews_count})</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-4 pb-4 mt-auto flex gap-2">
        {resource.status === 'APPROVED' && (
          <>
            <div className="flex flex-col w-full gap-2">
              <div className="flex w-full gap-2">
                <button
                  onClick={async () => {
                    try {
                      // Fetch the file as a blob via our API to ensure JWT token is sent
                      const previewUrl = `/resources/${resource.id}/preview/`;
                      const response = await apiClient.get(previewUrl, { responseType: 'blob' });
                      
                      const blob = new Blob([response.data], { type: response.headers['content-type'] });
                      const localUrl = URL.createObjectURL(blob);
                      
                      const isOfficeDoc = ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'].includes(resource.file_extension);
                      
                      if (isOfficeDoc) {
                        // For office docs, we still need an external viewer, 
                        // but Google Docs Viewer can't see our local blob URL.
                        // So for Office docs, we might still need a public URL or just let it download if local.
                        // For now, let's try to open the blob URL for everything else.
                        window.open(`https://docs.google.com/viewer?url=${encodeURIComponent(resource.file_url)}&embedded=true`, '_blank');
                      } else {
                        window.open(localUrl, '_blank');
                      }
                      
                      // Note: We should technically revoke the URL after some time, 
                      // but for a preview tab it's tricky.
                    } catch (error) {
                      console.error('Preview failed:', error);
                      // Fallback to direct URL if blob fetch fails
                      window.open(resource.file_url, '_blank');
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-secondary/10 text-secondary border border-secondary/20 px-3 py-2 rounded-lg hover:bg-secondary/20 transition-colors font-medium text-sm"
                >
                  <Eye className="w-4 h-4" />
                  Preview
                </button>
                {onDownload && (
                  <button
                    onClick={() => onDownload(resource.id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors font-medium text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                )}
                {onReport && (
                  <button
                    onClick={() => onReport(resource.id)}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    title="Report Resource"
                  >
                    <Flag className="w-4 h-4" />
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={() => onEdit(resource)}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-primary/10 text-primary transition-colors"
                    title="Edit Resource (Admin)"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to permanently delete this resource?')) {
                        onDelete(resource.id);
                      }
                    }}
                    className="flex items-center justify-center p-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                    title="Delete Resource (Admin)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <button
                onClick={() => window.location.href = `/resources/${resource.id}`}
                className="w-full flex items-center justify-center gap-2 bg-accent text-accent-foreground px-3 py-2 rounded-lg hover:bg-accent/90 transition-colors font-medium text-sm"
              >
                Details & Q&A
              </button>
            </div>
          </>
        )}

        {showActions && (
          <>
            {resource.status === 'PENDING' && (
              <>
                <button
                  onClick={() => onApprove?.(resource.id)}
                  className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                >
                  ✓ Approve
                </button>
                <button
                  onClick={() => onReject?.(resource.id)}
                  className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                >
                  ✕ Reject
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
