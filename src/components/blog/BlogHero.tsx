
import React from 'react';
import { BookOpen } from 'lucide-react';

const BlogHero = () => {
  return (
    <div className="text-center mb-16">
      <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 flex items-center justify-center gap-4">
        <BookOpen className="h-12 w-12 text-primary" />
        Moxie Travel Blog
      </h1>
      <p className="text-xl text-muted-foreground max-w-4xl mx-auto mb-8">
        Your gateway to Eugene adventures, travel insights, and stories from the heart of Oregon. 
        Discover hidden gems, local favorites, and travel inspiration from our hosts and guests.
      </p>
    </div>
  );
};

export default BlogHero;
