
import React from 'react';
import { useParams } from 'react-router-dom';

const BlogPostPage: React.FC = () => {
  const { slug } = useParams();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Blog Post: {slug}</h1>
      <p className="text-lg text-gray-600">
        Blog post content will be displayed here.
      </p>
    </div>
  );
};

export default BlogPostPage;
