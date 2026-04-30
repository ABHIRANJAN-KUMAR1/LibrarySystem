import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { requestsAPI } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, HelpCircle, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function RequestsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["requests"],
    queryFn: () => requestsAPI.getRequests().then(res => res.data),
  });

  const createRequestMutation = useMutation({
    mutationFn: () => requestsAPI.createRequest(title, description),
    onSuccess: () => {
      toast.success("Request posted successfully!");
      setTitle("");
      setDescription("");
      refetch();
    },
    onError: () => toast.error("Failed to post request"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    createRequestMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Resource Requests</h1>
        <p className="text-muted-foreground">Can't find what you need? Ask the community to upload it. Fulfill requests to earn bonus reputation points!</p>
      </div>

      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Post a Request</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g. 2023 Chemistry Midterm Solutions"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="Please provide any details about the specific resource you are looking for..."
              required 
            />
          </div>
          <Button type="submit" disabled={createRequestMutation.isPending || !title || !description}>
            {createRequestMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Post Request
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Active Requests</h2>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid gap-4">
            {data?.results?.length > 0 ? (
              data.results.map((req: any) => (
                <div key={req.id} className={`p-5 rounded-lg border flex gap-4 ${req.is_fulfilled ? 'bg-secondary/50 border-secondary' : 'bg-card'}`}>
                  <div className="mt-1">
                    {req.is_fulfilled ? <CheckCircle2 className="w-6 h-6 text-green-500" /> : <HelpCircle className="w-6 h-6 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{req.title}</h3>
                    <p className="text-muted-foreground text-sm mt-1">{req.description}</p>
                    <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
                      <span>Requested by <Link to={`/profile/${req.user.id}`} className="hover:underline font-medium">{req.user.full_name || req.user.username}</Link></span>
                      <span>•</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-center items-end">
                    {req.is_fulfilled ? (
                      <div className="text-sm text-green-600 font-medium bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">Fulfilled</div>
                    ) : (
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/upload?request_id=${req.id}`}>Upload to Fulfill</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground py-8 text-center border rounded-lg bg-card/50 border-dashed">No requests found. Be the first to ask!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
