import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Loader2 } from 'lucide-react';
import { adminAPI } from '@/services/api';
import { Resource } from '@/components/ResourceCard';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'science', label: 'Science' },
  { value: 'literature', label: 'Literature' },
  { value: 'history', label: 'History' },
  { value: 'computer_science', label: 'Computer Science' },
  { value: 'arts', label: 'Arts' },
  { value: 'language', label: 'Language' },
  { value: 'philosophy', label: 'Philosophy' },
  { value: 'books', label: 'Books' },
  { value: 'notes', label: 'Notes' },
  { value: 'videos', label: 'Videos' },
  { value: 'papers', label: 'Research Papers' },
  { value: 'slides', label: 'Slides / Presentations' },
  { value: 'other', label: 'Other' },
];

interface EditResourceModalProps {
  resource: Resource | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditResourceModal({ resource, isOpen, onClose, onSuccess }: EditResourceModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    tags_str: '',
  });

  useEffect(() => {
    if (resource) {
      setFormData({
        title: resource.title,
        description: resource.description || '',
        category: resource.category_slug || resource.category || 'other',
        tags_str: resource.tags?.map(t => t.name).join(', ') || '',
      });
    }
  }, [resource]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resource) return;

    setIsLoading(true);
    try {
      await adminAPI.updateResource(resource.id, formData);
      toast.success('Resource updated successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Update failed:', error);
      toast.error('Failed to update resource');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
        <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-md bg-card border border-border rounded-xl shadow-2xl p-6 z-50 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-xl font-bold">Edit Resource</Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-2 hover:bg-muted rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none resize-none h-32"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={formData.tags_str}
                onChange={(e) => setFormData(prev => ({ ...prev, tags_str: e.target.value }))}
                className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="Math, Calculus, Solutions"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Dialog.Close asChild>
                <button type="button" className="flex-1 py-2 px-4 border border-border rounded-lg font-semibold hover:bg-muted transition-colors">
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
