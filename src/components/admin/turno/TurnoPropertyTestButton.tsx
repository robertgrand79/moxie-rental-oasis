import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, TestTube } from "lucide-react";

export const TurnoPropertyTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const testTurnoConnection = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('turno-sync');
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Turno API Test Successful",
          description: `Found ${data.stats?.totalProperties || 0} properties and ${data.stats?.totalProblems || 0} problems`,
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Turno API test failed:', error);
      toast({
        title: "Turno API Test Failed",
        description: error.message || 'Failed to connect to Turno API',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('turno-sync/properties');
      
      if (error) throw error;
      
      if (data.success) {
        toast({
          title: "Properties Synced",
          description: `Fetched and cached ${data.cached || 0} Turno properties`,
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Properties sync failed:', error);
      toast({
        title: "Properties Sync Failed",
        description: error.message || 'Failed to sync Turno properties',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button
        onClick={testTurnoConnection}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TestTube className="h-4 w-4" />
        )}
        Test API Connection
      </Button>
      
      <Button
        onClick={fetchProperties}
        disabled={isLoading}
        variant="outline"
        size="sm"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <TestTube className="h-4 w-4" />
        )}
        Fetch Properties
      </Button>
    </div>
  );
};