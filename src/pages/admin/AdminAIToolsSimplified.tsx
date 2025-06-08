
import React, { useState } from 'react';
import { Wand2, Eye, Download, Trash2, Image, FileText, Calendar, MapPin } from 'lucide-react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';

interface GeneratedContent {
  id: string;
  type: 'poi' | 'events' | 'lifestyle';
  title: string;
  content: string;
  image?: string;
  timestamp: Date;
  status: 'pending' | 'approved' | 'rejected';
}

const AdminAIToolsSimplified = () => {
  const [selectedType, setSelectedType] = useState<'poi' | 'events' | 'lifestyle'>('poi');
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([]);
  const { generateContent, isGenerating } = useAIContentGeneration();

  const contentTypes = [
    {
      id: 'poi' as const,
      title: 'Points of Interest',
      icon: <MapPin className="h-5 w-5" />,
      description: 'Generate local attractions and places to visit',
      template: 'Generate 3 unique points of interest in Eugene, Oregon that would appeal to vacation rental guests. Include name, description, location, and why guests would enjoy visiting.'
    },
    {
      id: 'events' as const,
      title: 'Events',
      icon: <Calendar className="h-5 w-5" />,
      description: 'Create engaging local events and activities',
      template: 'Generate 3 upcoming events in Eugene, Oregon that vacation rental guests would find interesting. Include event name, date, location, description, and ticket information.'
    },
    {
      id: 'lifestyle' as const,
      title: 'Lifestyle Content',
      icon: <Image className="h-5 w-5" />,
      description: 'Create lifestyle and experience content',
      template: 'Generate 3 lifestyle experiences showcasing Eugene, Oregon for vacation rental guests. Include title, description, and why it represents the Eugene lifestyle.'
    }
  ];

  const handleGenerate = async () => {
    const prompt = customPrompt || contentTypes.find(t => t.id === selectedType)?.template || '';
    
    const content = await generateContent(selectedType, prompt, selectedType, 1);
    
    if (content && content.length > 0) {
      const newContent: GeneratedContent = {
        id: Date.now().toString(),
        type: selectedType,
        title: content[0].title || `Generated ${selectedType}`,
        content: content[0].description || content[0].content || JSON.stringify(content[0]),
        image: content[0].image_url,
        timestamp: new Date(),
        status: 'pending'
      };
      
      setGeneratedContent(prev => [newContent, ...prev]);
    }
  };

  const handleApprove = (id: string) => {
    setGeneratedContent(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'approved' as const } : item
      )
    );
  };

  const handleReject = (id: string) => {
    setGeneratedContent(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'rejected' as const } : item
      )
    );
  };

  const handleDelete = (id: string) => {
    setGeneratedContent(prev => prev.filter(item => item.id !== id));
  };

  return (
    <AdminPageWrapper
      title="AI Content Generator"
      description="Generate and manage AI content for your website"
    >
      <div className="p-8 space-y-8">
        {/* Content Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {contentTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedType === type.id ? 'ring-2 ring-primary bg-primary/5' : ''
              }`}
              onClick={() => setSelectedType(type.id)}
            >
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center space-y-3">
                  <div className={`p-3 rounded-full ${
                    selectedType === type.id ? 'bg-primary text-primary-foreground' : 'bg-gray-100'
                  }`}>
                    {type.icon}
                  </div>
                  <h3 className="font-semibold">{type.title}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Content Generation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Wand2 className="h-5 w-5 mr-2" />
              Generate {contentTypes.find(t => t.id === selectedType)?.title}
            </CardTitle>
            <CardDescription>
              Customize your prompt or use the default template
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder={contentTypes.find(t => t.id === selectedType)?.template}
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                rows={4}
              />
            </div>
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
              className="w-full"
            >
              <Wand2 className="h-4 w-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Content'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Content Review */}
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">Generated Content</h3>
          
          {generatedContent.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                <Wand2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content generated yet. Use the generator above to create content.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {generatedContent.map((item) => (
                <Card key={item.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        <Badge 
                          variant={
                            item.status === 'approved' ? 'default' : 
                            item.status === 'rejected' ? 'destructive' : 
                            'secondary'
                          }
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(item.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(item.id)}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardDescription>
                      Generated on {item.timestamp.toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {item.image && (
                      <img 
                        src={item.image} 
                        alt="Generated" 
                        className="w-32 h-32 object-cover rounded mb-4" 
                      />
                    )}
                    <div className="prose max-w-none">
                      <div className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border max-h-48 overflow-y-auto">
                        {item.content}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminAIToolsSimplified;
