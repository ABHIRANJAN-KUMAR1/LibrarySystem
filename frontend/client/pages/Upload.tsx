import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { resourcesAPI } from '@/services/api';
import { Upload as UploadIcon, FileText } from 'lucide-react';
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

export default function Upload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get('request_id');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mathematics',
    tags: '',
    file: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({
        ...prev,
        file,
      }));
    }
  };

  const handleSuggestTags = async () => {
    if (!formData.title && !formData.description) {
      toast.error('Please enter a title or description first');
      return;
    }
    
    setIsSuggesting(true);
    try {
      const response = await resourcesAPI.suggestTags({
        title: formData.title,
        description: formData.description
      });
      const suggested = response.data.tags;
      if (suggested && suggested.length > 0) {
        const currentTags = formData.tags ? formData.tags.split(',').map(t => t.trim()) : [];
        const newTags = Array.from(new Set([...currentTags, ...suggested])).filter(t => t).join(', ');
        setFormData(prev => ({ ...prev, tags: newTags }));
        toast.success('Tags suggested!');
      } else {
        toast.info('No specific tags suggested for this content.');
      }
    } catch (error) {
      console.error('Tag suggestion failed:', error);
      toast.error('Failed to suggest tags');
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setIsLoading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('title', formData.title);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('category', formData.category);
      if (formData.tags.trim()) {
        uploadFormData.append('tags_str', formData.tags);
      }
      uploadFormData.append('file', formData.file);
      if (requestId) {
        uploadFormData.append('linked_request', requestId);
      }

      await resourcesAPI.upload(uploadFormData);
      toast.success('Resource uploaded successfully! It will be visible after admin approval.');
      navigate('/dashboard');
    } catch (error: any) {
      const errorData = error.response?.data;
      let message = 'Upload failed. Please try again.';
      
      if (errorData) {
        if (typeof errorData === 'object' && !errorData.detail) {
          // It's a DRF field error dictionary
          const firstKey = Object.keys(errorData)[0];
          const errorValue = errorData[firstKey];
          message = `${firstKey}: ${Array.isArray(errorValue) ? errorValue[0] : errorValue}`;
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      }
      
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/20 mb-4">
          <UploadIcon className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Upload Resource</h1>
        <p className="text-muted-foreground">
          {requestId 
            ? "You are uploading this resource to fulfill a community request. Once approved, the request will be marked as complete!" 
            : "Share your educational resource with the community. Resources will be reviewed and approved by our admin team."}
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Resource Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Introduction to Linear Algebra"
              required
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Provide a clear and descriptive title
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this resource covers..."
              rows={5}
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Help others understand what they'll learn from this resource
            </p>
          </div>

          {/* Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-semibold">Tags</label>
                <button 
                  type="button"
                  onClick={handleSuggestTags}
                  disabled={isSuggesting}
                  className="text-[10px] uppercase font-bold tracking-wider text-primary hover:text-primary/80 disabled:opacity-50"
                >
                  {isSuggesting ? 'Thinking...' : '✨ Suggest Tags'}
                </button>
              </div>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g. Algebra, Exams, Notes"
                className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Comma-separated tags (optional)
              </p>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">Select File *</label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative">
              <input
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="font-semibold mb-1">
                {formData.file ? formData.file.name : 'Click to select file or drag and drop'}
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
              </p>
            </div>
            {formData.file && (
              <div className="mt-3 flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
                <FileText className="w-4 h-4 text-primary" />
                <div className="flex-1 text-sm">
                  <p className="font-medium">{formData.file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(formData.file.size / (1024 * 1024)).toFixed(2)} MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-secondary/10 border border-secondary/20 rounded-lg p-4">
            <p className="text-sm">
              <span className="font-semibold">Note:</span> Your resource will be reviewed by our admin team and will appear in the library once approved. This typically takes 24-48 hours.
            </p>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2 px-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Uploading...' : 'Upload Resource'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-2 px-4 border border-border text-foreground rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
