import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { collectionsAPI } from "@/services/api";
import { ResourceCard } from "@/components/ResourceCard";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CollectionDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: collection, isLoading } = useQuery({
    queryKey: ["collection", id],
    queryFn: () => collectionsAPI.getCollection(Number(id)).then(res => res.data),
  });

  if (isLoading) {
    return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!collection) {
    return <div className="p-8 text-center text-muted-foreground">Collection not found or private.</div>;
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl space-y-8">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/collections"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Collections</Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">{collection.name}</h1>
        <p className="text-muted-foreground mt-2">{collection.description}</p>
        <div className="text-sm mt-4">
          Created by <Link to={`/profile/${collection.user?.id}`} className="text-primary hover:underline">{collection.user?.full_name || collection.user?.username}</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collection.items?.length > 0 ? (
          collection.items.map((item: any) => (
            <ResourceCard key={item.id} resource={item.resource} />
          ))
        ) : (
          <p className="col-span-full text-muted-foreground py-8 text-center border rounded-lg bg-card/50 border-dashed">No resources in this collection yet.</p>
        )}
      </div>
    </div>
  );
}
