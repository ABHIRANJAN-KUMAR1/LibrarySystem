import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Users, FileText, Shield, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { resourcesAPI } from '@/services/api';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['public-stats'],
    queryFn: () => resourcesAPI.getPublicStats().then(res => res.data),
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gradient-to-br from-primary/5 via-secondary/5 to-background">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-foreground mb-6">
            Digital Educational
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Resource Library
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Discover, upload, and share quality educational resources. A community-driven platform where knowledge is curated and approved by experts.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Go to Dashboard
                </Link>
                {user?.role === 'user' && (
                  <Link
                    to="/upload"
                    className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    Upload Resource
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link
                    to="/admin/pending"
                    className="px-8 py-3 bg-secondary text-secondary-foreground rounded-lg font-semibold hover:bg-secondary/90 transition-colors"
                  >
                    Review Pending
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Get Started
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mt-20">
          <Feature
            icon={<BookOpen className="w-8 h-8" />}
            title="Vast Collection"
            description="Access thousands of curated educational materials"
          />
          <Feature
            icon={<Users className="w-8 h-8" />}
            title="Community Driven"
            description="Upload and share your own educational resources"
          />
          <Feature
            icon={<Shield className="w-8 h-8" />}
            title="Quality Assured"
            description="All resources are reviewed and approved by experts"
          />
          <Feature
            icon={<FileText className="w-8 h-8" />}
            title="Multiple Formats"
            description="PDF, documents, videos, and more formats supported"
          />
        </div>
      </section>

    </div>
  );
}

function Feature({ icon, title, description }: any) {
  return (
    <div className="bg-card rounded-lg border border-border p-6 text-center hover:shadow-md transition-shadow">
      <div className="flex justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div>
      <div className="text-3xl font-bold text-primary mb-2">{value}</div>
      <div className="text-muted-foreground text-sm">{label}</div>
    </div>
  );
}
