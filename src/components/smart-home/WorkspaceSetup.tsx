import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Property } from '@/types/property';
import { Home, ExternalLink, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface WorkspaceSetupProps {
  property: Property;
  onWorkspaceCreated: () => void;
}

export const WorkspaceSetup = ({ property, onWorkspaceCreated }: WorkspaceSetupProps) => {
  const [workspaceId, setWorkspaceId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateWorkspace = async () => {
    if (!workspaceId || !workspaceName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Create workspace record
      const { data, error } = await supabase
        .from('seam_workspaces')
        .insert({
          property_id: property.id,
          workspace_id: workspaceId.trim(),
          workspace_name: workspaceName.trim(),
          api_key_configured: true,
          is_active: true,
          sync_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Seam workspace connected successfully",
      });

      onWorkspaceCreated();

    } catch (error: any) {
      console.error('Error creating workspace:', error);
      
      let errorMessage = "Failed to connect Seam workspace";
      if (error.code === '23505') {
        errorMessage = "This workspace ID is already connected to another property";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Home className="h-5 w-5" />
            Connect Seam Workspace
          </CardTitle>
          <CardDescription className="text-blue-700">
            Connect your Seam workspace to manage August smart locks and Honeywell thermostats
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">Supported Devices</h4>
              <p className="text-sm text-blue-700">
                August Smart Locks, Honeywell Thermostats, and other Seam-compatible devices
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">Automated Guest Access</h4>
              <p className="text-sm text-blue-700">
                Automatically create and manage access codes for guest reservations
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-800">Remote Control</h4>
              <p className="text-sm text-blue-700">
                Lock/unlock doors and adjust thermostats remotely from your dashboard
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Setup Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">1</Badge>
              <div>
                <p className="font-medium">Create a Seam Account</p>
                <p className="text-sm text-muted-foreground">
                  Sign up at{' '}
                  <a href="https://connect.getseam.com" target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:underline inline-flex items-center gap-1">
                    connect.getseam.com
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">2</Badge>
              <div>
                <p className="font-medium">Connect Your Devices</p>
                <p className="text-sm text-muted-foreground">
                  Add your August smart locks and Honeywell thermostats to your Seam workspace
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <Badge variant="outline" className="mt-0.5">3</Badge>
              <div>
                <p className="font-medium">Get Workspace Information</p>
                <p className="text-sm text-muted-foreground">
                  Find your workspace ID and name in your Seam dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle>Workspace Configuration</CardTitle>
          <CardDescription>
            Enter your Seam workspace details to connect your smart devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspaceId">Workspace ID *</Label>
            <Input
              id="workspaceId"
              value={workspaceId}
              onChange={(e) => setWorkspaceId(e.target.value)}
              placeholder="e.g., ws_abc123..."
              className="font-mono text-sm"
            />
            <p className="text-sm text-muted-foreground">
              Find this in your Seam dashboard under Workspace Settings
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspaceName">Workspace Name *</Label>
            <Input
              id="workspaceName"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g., Property Name - Smart Devices"
            />
            <p className="text-sm text-muted-foreground">
              A friendly name to identify this workspace
            </p>
          </div>

          <Button 
            onClick={handleCreateWorkspace}
            disabled={loading || !workspaceId || !workspaceName}
            className="w-full"
          >
            {loading ? 'Connecting...' : 'Connect Workspace'}
          </Button>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800">Security Note</p>
                <p className="text-yellow-700">
                  Your Seam API key should be configured in the system secrets. 
                  Contact your administrator if you need help with API key setup.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};