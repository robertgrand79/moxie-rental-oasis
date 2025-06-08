
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProperties } from '@/hooks/useProperties';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import { sampleProperties, sampleBlogPosts } from '@/utils/sampleData';
import { useToast } from '@/hooks/use-toast';
import { Database, FileText, Loader2 } from 'lucide-react';

const SampleDataManager = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { addProperty, properties } = useProperties();
  const { addBlogPost, blogPosts } = useBlogPosts();
  const { toast } = useToast();

  const addSampleProperties = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      for (const property of sampleProperties) {
        const result = await addProperty(property);
        if (result) successCount++;
      }
      
      toast({
        title: "Success",
        description: `Added ${successCount} sample properties successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sample properties",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSampleBlogPosts = async () => {
    setIsLoading(true);
    try {
      let successCount = 0;
      for (const post of sampleBlogPosts) {
        const result = await addBlogPost(post);
        if (result) successCount++;
      }
      
      toast({
        title: "Success",
        description: `Added ${successCount} sample blog posts successfully!`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add sample blog posts",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Sample Data Manager</h2>
        <p className="text-gray-600">Populate your site with sample content to test features and showcase your vacation rental business.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2 text-icon-blue" />
              Properties ({properties.length})
            </CardTitle>
            <CardDescription>
              Add sample vacation rental properties to showcase your listings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Sample properties include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Downtown Eugene Cottage</li>
                  <li>Modern Riverfront Apartment</li>
                  <li>Family-Friendly Suburban Home</li>
                  <li>Luxury University District Loft</li>
                </ul>
              </div>
              <Button 
                onClick={addSampleProperties}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Properties...
                  </>
                ) : (
                  'Add Sample Properties'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-icon-purple" />
              Blog Posts ({blogPosts.length})
            </CardTitle>
            <CardDescription>
              Add sample blog content about Eugene attractions and travel tips
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>Sample blog posts include:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Eugene's Food Scene Guide</li>
                  <li>Outdoor Adventures</li>
                  <li>University of Oregon Campus</li>
                </ul>
              </div>
              <Button 
                onClick={addSampleBlogPosts}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding Blog Posts...
                  </>
                ) : (
                  'Add Sample Blog Posts'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Getting Started</h3>
              <p className="text-blue-800 text-sm">
                Add sample content to see how your vacation rental site will look with real data. You can always edit or delete this content later through the respective management pages.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SampleDataManager;
