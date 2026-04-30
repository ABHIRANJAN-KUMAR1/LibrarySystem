import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { threadsAPI, collectionsAPI, resourcesAPI, apiClient } from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { 
  Loader2, MessageSquare, Send, Trash2, Calendar, User, ShieldCheck, 
  Download, Bookmark, Flag, Star, PlusCircle, ExternalLink 
} from "lucide-react";

export default function ResourceDetail() {
  const { id } = useParams<{ id: string }>();
  const [question, setQuestion] = useState("");
  const [replyText, setReplyText] = useState("");
  const [activeThread, setActiveThread] = useState<number | null>(null);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const { data: resource, isLoading: isResourceLoading, refetch: refetchResource } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => resourcesAPI.getResource(Number(id)).then(res => res.data),
  });

  const { data: threads, isLoading: isThreadsLoading, refetch: refetchThreads } = useQuery({
    queryKey: ["threads", id],
    queryFn: () => threadsAPI.getThreads(Number(id)).then(res => res.data),
  });

  const { data: reviews, refetch: refetchReviews } = useQuery({
    queryKey: ["reviews", id],
    queryFn: () => resourcesAPI.getReviews(Number(id)).then(res => res.data),
  });

  const createThreadMutation = useMutation({
    mutationFn: () => threadsAPI.createThread(Number(id), question),
    onSuccess: () => {
      setQuestion("");
      refetchThreads();
      toast.success("Question posted!");
    }
  });

  const replyMutation = useMutation({
    mutationFn: (threadId: number) => threadsAPI.replyToThread(threadId, replyText),
    onSuccess: () => {
      setReplyText("");
      setActiveThread(null);
      refetchThreads();
      toast.success("Reply posted!");
    }
  });

  const postReviewMutation = useMutation({
    mutationFn: () => resourcesAPI.postReview(Number(id), reviewRating, reviewComment),
    onSuccess: () => {
      setReviewComment("");
      setReviewRating(5);
      refetchReviews();
      refetchResource();
      toast.success("Review posted!");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error || "Failed to post review");
    }
  });

  const toggleBookmarkMutation = useMutation({
    mutationFn: () => resourcesAPI.toggleBookmark(Number(id)),
    onSuccess: (res) => {
      toast.success(res.data.message);
      refetchResource();
    }
  });

  const handleDownload = async () => {
    try {
      const response = await resourcesAPI.download(Number(id));
      const fileUrl = response.data.file_url;
      const link = document.createElement('a');
      link.href = fileUrl;
      link.setAttribute('download', '');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download started!');
      refetchResource();
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handleReport = async () => {
    const reason = window.prompt("Why are you reporting this resource?");
    if (reason?.trim()) {
      try {
        await resourcesAPI.reportResource(Number(id), reason);
        toast.success("Report submitted for review.");
      } catch (error) {
        toast.error("Failed to submit report.");
      }
    }
  };

  if (isResourceLoading) return <div className="p-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>;

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      {/* Resource Header Card */}
      {resource && (
        <div className="bg-card rounded-2xl p-8 border shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-4 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight">{resource.title}</h1>
                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase">
                  {resource.category}
                </span>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed">{resource.description}</p>
              
              <div className="flex flex-wrap items-center gap-6 pt-2 text-sm text-muted-foreground">
                <Link to={`/profile/${resource.uploaded_by.id}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                  <User className="w-4 h-4" />
                  <span className="font-medium">By {resource.uploaded_by.full_name || resource.uploaded_by.username}</span>
                </Link>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Uploaded {new Date(resource.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{resource.download_count} Downloads</span>
                </div>
                {resource.average_rating > 0 && (
                  <div className="flex items-center gap-1 text-yellow-600 font-bold">
                    <Star className="w-4 h-4 fill-yellow-600" />
                    <span>{Number(resource.average_rating).toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              <Button onClick={handleDownload} className="w-full gap-2">
                <Download className="w-4 h-4" /> Download File
              </Button>
              <Button variant="outline" onClick={() => toggleBookmarkMutation.mutate()} className="w-full gap-2">
                <Bookmark className={`w-4 h-4 ${resource.is_bookmarked ? 'fill-primary' : ''}`} /> 
                {resource.is_bookmarked ? 'Bookmarked' : 'Bookmark'}
              </Button>
              <Button variant="ghost" onClick={handleReport} className="w-full gap-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                <Flag className="w-4 h-4" /> Report Content
              </Button>
            </div>
          </div>

          {resource.status === 'APPROVED' && resource.approved_by && (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-xl text-sm border border-green-200 dark:border-green-800 w-fit">
              <ShieldCheck className="w-5 h-5" />
              <span>Verified Educational Resource • Approved by Admin ({resource.approved_by.username})</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Q&A */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><MessageSquare className="w-5 h-5" /> Q&A Discussion</h2>
            
            <div className="flex gap-2 mb-8">
              <Input 
                value={question} 
                onChange={(e) => setQuestion(e.target.value)} 
                placeholder="Ask a question about this resource..."
                className="bg-muted/50"
              />
              <Button onClick={() => createThreadMutation.mutate()} disabled={!question || createThreadMutation.isPending}>
                Post
              </Button>
            </div>

            <div className="space-y-6">
              {threads?.length === 0 && <p className="text-center text-muted-foreground py-4 italic">No discussions yet. Be the first to ask!</p>}
              {threads?.map((thread: any) => (
                <div key={thread.id} className="border rounded-xl p-5 bg-background hover:border-primary/30 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-lg">{thread.question}</div>
                    {isAdmin && (
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-500 h-8 w-8">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2 mb-4">
                    <span className="font-medium text-foreground">{thread.user.full_name || thread.user.username}</span>
                    <span className="text-muted-foreground">(@{thread.user.username})</span>
                    <span>•</span>
                    <span>{new Date(thread.created_at).toLocaleDateString()}</span>
                  </div>

                  <div className="ml-6 space-y-3 border-l-2 border-muted pl-4">
                    {thread.replies?.map((reply: any) => (
                      <div key={reply.id} className="bg-muted/30 p-3 rounded-lg text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-primary">{reply.user.full_name || reply.user.username}</span>
                          <span className="text-[10px] text-muted-foreground">{new Date(reply.created_at).toLocaleDateString()}</span>
                        </div>
                        {reply.reply}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 ml-6">
                    {activeThread === thread.id ? (
                      <div className="flex gap-2 animate-in slide-in-from-top-2 duration-200">
                        <Input 
                          value={replyText} 
                          onChange={(e) => setReplyText(e.target.value)} 
                          placeholder="Write a reply..."
                          className="h-9 text-sm"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => replyMutation.mutate(thread.id)} disabled={!replyText}>
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => setActiveThread(null)}>Cancel</Button>
                      </div>
                    ) : (
                      <Button variant="link" size="sm" className="h-auto p-0 text-primary font-semibold" onClick={() => setActiveThread(thread.id)}>
                        Reply to this thread
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Reviews */}
        <div className="space-y-6">
          <div className="bg-card rounded-xl p-6 border shadow-sm">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Star className="w-5 h-5" /> Reviews</h2>
            
            <div className="space-y-4 mb-8 p-4 bg-muted/30 rounded-xl border border-dashed">
              <p className="text-sm font-semibold mb-2">Rate this resource</p>
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    onClick={() => setReviewRating(star)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <textarea 
                className="w-full bg-background border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[80px]"
                placeholder="Share your feedback..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
              />
              <Button 
                onClick={() => postReviewMutation.mutate()} 
                className="w-full mt-2"
                disabled={postReviewMutation.isPending}
              >
                Submit Review
              </Button>
            </div>

            <div className="space-y-4">
              {reviews?.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No reviews yet.</p>}
              {reviews?.map((review: any) => (
                <div key={review.id} className="border-b last:border-0 pb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm">{review.user.full_name || review.user.username}</span>
                    <div className="flex text-yellow-500">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="w-3 h-3 fill-current" />)}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{review.comment}"</p>
                  <span className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
