
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIAnalyticsDashboard from '@/components/admin/AIAnalyticsDashboard';
import AIContentGenerators from '@/components/admin/AIContentGenerators';
import AIDataEnhancer from '@/components/admin/AIDataEnhancer';
import { Wand2, BarChart3, Sparkles } from 'lucide-react';

const AdminAITools = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wand2 className="h-5 w-5 mr-2" />
            AI Tools & Analytics
          </CardTitle>
          <CardDescription>
            Leverage AI-powered tools to enhance your content and gain insights
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="generators">
            <Wand2 className="h-4 w-4 mr-2" />
            Content Generators
          </TabsTrigger>
          <TabsTrigger value="enhancer">
            <Sparkles className="h-4 w-4 mr-2" />
            Data Enhancer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AIAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="generators">
          <AIContentGenerators />
        </TabsContent>

        <TabsContent value="enhancer">
          <AIDataEnhancer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAITools;
