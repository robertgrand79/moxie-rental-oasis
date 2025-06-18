
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell,
  ResponsiveContainer
} from 'recharts';
import { 
  Image, 
  Zap, 
  TrendingDown, 
  Clock, 
  Eye, 
  Settings,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useAdvancedImageOptimization } from '@/hooks/useAdvancedImageOptimization';
import LoadingState from '@/components/ui/loading-state';

const ImageOptimizationDashboard = () => {
  const { 
    analytics, 
    settings, 
    loading, 
    loadAnalytics, 
    auditImages, 
    updateSettings 
  } = useAdvancedImageOptimization();
  
  const [auditResults, setAuditResults] = useState<any[]>([]);
  const [auditing, setAuditing] = useState(false);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleAuditImages = async () => {
    setAuditing(true);
    const results = await auditImages();
    setAuditResults(results);
    setAuditing(false);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  if (loading && !analytics) {
    return <LoadingState variant="card" message="Loading optimization analytics..." />;
  }

  const pieColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bandwidth Saved</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatBytes(analytics?.totalBandwidthSaved || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total across all optimizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Compression</CardTitle>
            <Zap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {analytics?.averageCompressionRatio?.toFixed(1) || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average file size reduction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Optimizations</CardTitle>
            <Image className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {analytics?.performanceImpact?.totalOptimizations || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Total images processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatDuration(analytics?.performanceImpact?.averageLoadTime || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average image load time
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="formats">Format Analytics</TabsTrigger>
          <TabsTrigger value="audit">Image Audit</TabsTrigger>
          <TabsTrigger value="settings">Optimization Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Format Distribution</CardTitle>
                <CardDescription>
                  Popular image formats after optimization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics?.popularFormats || {}).map(([format, count]) => ({
                        name: format.toUpperCase(),
                        value: count
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {Object.entries(analytics?.popularFormats || {}).map((_, index) => (
                        <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Impact</CardTitle>
                <CardDescription>
                  Image optimization effectiveness over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Bandwidth Efficiency</span>
                    <Badge variant="secondary">
                      {analytics?.averageCompressionRatio?.toFixed(1)}% avg reduction
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.min(100, (analytics?.averageCompressionRatio || 0))} 
                    className="h-2"
                  />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Load Time Optimization</span>
                    <Badge variant="secondary">
                      {formatDuration(analytics?.performanceImpact?.averageLoadTime || 0)}
                    </Badge>
                  </div>
                  <Progress 
                    value={Math.max(0, 100 - (analytics?.performanceImpact?.averageLoadTime || 0) / 50)} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="formats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Format Performance Comparison</CardTitle>
              <CardDescription>
                Compression efficiency by image format
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart
                  data={Object.entries(analytics?.popularFormats || {}).map(([format, count]) => ({
                    format: format.toUpperCase(),
                    count,
                    efficiency: format === 'webp' ? 85 : format === 'avif' ? 90 : format === 'jpeg' ? 75 : 60
                  }))}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="format" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" name="Usage Count" />
                  <Bar dataKey="efficiency" fill="#82ca9d" name="Avg Efficiency %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Image Optimization Audit</CardTitle>
              <CardDescription>
                Identify images that could benefit from optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleAuditImages}
                disabled={auditing}
                className="w-full sm:w-auto"
              >
                {auditing ? (
                  <>
                    <Settings className="mr-2 h-4 w-4 animate-spin" />
                    Auditing Images...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Run Image Audit
                  </>
                )}
              </Button>

              {auditResults.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">
                    Found {auditResults.length} unoptimized images:
                  </h4>
                  
                  {auditResults.slice(0, 10).map((item, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{item.postTitle}</div>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.imageUrl}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Needs optimization
                      </Badge>
                    </div>
                  ))}
                  
                  {auditResults.length > 10 && (
                    <p className="text-sm text-muted-foreground">
                      And {auditResults.length - 10} more images...
                    </p>
                  )}
                </div>
              )}

              {auditResults.length === 0 && !auditing && (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h4 className="font-medium text-green-600">All images are optimized!</h4>
                  <p className="text-sm text-muted-foreground">
                    No unoptimized images found in your blog posts.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Quality Settings</CardTitle>
                <CardDescription>
                  Default quality levels for different formats
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(settings?.qualitySettings || {}).map(([format, quality]) => (
                  <div key={format} className="space-y-2">
                    <div className="flex justify-between">
                      <label className="text-sm font-medium capitalize">{format}</label>
                      <span className="text-sm text-muted-foreground">{quality}%</span>
                    </div>
                    <Progress value={quality as number} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Size Breakpoints</CardTitle>
                <CardDescription>
                  Responsive image size breakpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(settings?.sizeBreakpoints || {}).map(([size, width]) => (
                    <div key={size} className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{size}</span>
                      <Badge variant="secondary">{width}px</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Format Preferences</CardTitle>
                <CardDescription>
                  Priority order for image format selection
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {settings?.formatPreferences?.map((format, index) => (
                    <div key={format} className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <span className="text-sm font-medium uppercase">{format}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Budget</CardTitle>
                <CardDescription>
                  Size limits and performance thresholds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(settings?.performanceBudget || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <Badge variant="secondary">
                        {typeof value === 'number' && key.includes('kb') ? `${value}KB` :
                         typeof value === 'number' && key.includes('mb') ? `${value}MB` :
                         String(value)}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImageOptimizationDashboard;
