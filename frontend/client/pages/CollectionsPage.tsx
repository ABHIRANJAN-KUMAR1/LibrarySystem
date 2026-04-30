import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { collectionsAPI } from "@/services/api";
import { ResourceCard } from "@/components/ResourceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, FolderPlus, FolderOpen, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CollectionsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const { data: collections, isLoading, refetch } = useQuery({
    queryKey: ["collections"],
    queryFn: () => collectionsAPI.getCollections().then(res => res.data),
  });

  const createCollectionMutation = useMutation({
    mutationFn: () => collectionsAPI.createCollection(name, description, true),
    onSuccess: () => {
      toast.success("Collection created successfully!");
      setName("");
      setDescription("");
      refetch();
    },
    onError: () => toast.error("Failed to create collection"),
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: number) => collectionsAPI.deleteCollection(id),
    onSuccess: () => {
      toast.success("Collection removed");
      refetch();
    },
    onError: () => toast.error("Failed to remove collection"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    createCollectionMutation.mutate();
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">My Collections</h1>
        <p className="text-muted-foreground">Group your bookmarked resources into custom playlists and collections.</p>
      </div>

      <div className="bg-card rounded-xl p-6 border shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2"><FolderPlus className="w-5 h-5" /> Create New Collection</h2>
        <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="e.g. Math 101 Finals Prep"
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="A short description..."
              rows={2}
            />
          </div>
          <Button type="submit" disabled={createCollectionMutation.isPending || !name}>
            {createCollectionMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Create
          </Button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Your Collections</h2>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections?.length > 0 ? (
              collections.map((col: any) => (
                <Link to={`/collections/${col.id}`} key={col.id} className="block group">
                  <div className="bg-card rounded-xl p-6 border shadow-sm hover:shadow-md transition-all h-full flex flex-col">
                    <div className="flex items-center justify-between gap-3 mb-3 text-primary group-hover:scale-105 transition-transform origin-left">
                      <div className="flex items-center gap-3">
                        <FolderOpen className="w-8 h-8" />
                        <h3 className="text-xl font-semibold">{col.name}</h3>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (window.confirm("Are you sure you want to delete this collection?")) {
                            deleteCollectionMutation.mutate(col.id);
                          }
                        }}
                        className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-muted-foreground text-sm flex-1">{col.description || "No description provided."}</p>
                    <div className="mt-4 pt-4 border-t flex justify-between items-center text-sm text-muted-foreground">
                      <span>{col.item_count} Items</span>
                      <span>{new Date(col.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="col-span-full text-muted-foreground py-8 text-center border rounded-lg bg-card/50 border-dashed">You haven't created any collections yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
