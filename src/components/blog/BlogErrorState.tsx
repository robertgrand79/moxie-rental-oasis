
import React from 'react';
import { Button } from '@/components/ui/button';

interface BlogErrorStateProps {
  error: string;
}

const BlogErrorState = ({ error }: BlogErrorStateProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl font-bold text-foreground mb-4">Something went wrong</h1>
        <p className="text-xl text-muted-foreground mb-8">{error}</p>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    </div>
  );
};

export default BlogErrorState;
