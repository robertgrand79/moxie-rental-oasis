import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { debug } from '@/utils/debug';

const PropertyDiagnostics = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runDiagnostics = async () => {
    debug.db('[DIAGNOSTICS] Starting comprehensive property system diagnostics...');
    setTesting(true);
    const diagnosticResults: any = {
      authentication: { status: 'unknown', details: {} },
      permissions: { status: 'unknown', details: {} },
      database: { status: 'unknown', details: {} },
      storage: { status: 'unknown', details: {} }
    };

    try {
      debug.db('[DIAGNOSTICS] Testing authentication...');
      diagnosticResults.authentication = {
        status: user ? 'success' : 'error',
        details: {
          userId: user?.id,
          userEmail: user?.email,
          hasAuth: !!user,
          sessionValid: !!supabase.auth.getSession()
        }
      };

      if (!user) {
        diagnosticResults.authentication.message = 'No authenticated user found';
        setResults(diagnosticResults);
        return;
      }

      debug.db('[DIAGNOSTICS] Testing database permissions...');
      try {
        const { data: readTest, error: readError } = await supabase
          .from('properties')
          .select('id, title')
          .limit(1);

        const testProperty = {
          title: 'DIAGNOSTIC_TEST_PROPERTY',
          description: 'This is a test property for diagnostics',
          location: 'Test Location',
          bedrooms: 1,
          bathrooms: 1,
          max_guests: 1,
          price_per_night: 1,
          created_by: user.id
        };

        const { data: writeTest, error: writeError } = await supabase
          .from('properties')
          .insert(testProperty)
          .select()
          .single();

        if (writeTest?.id) {
          await supabase.from('properties').delete().eq('id', writeTest.id);
        }

        diagnosticResults.permissions = {
          status: !readError && !writeError ? 'success' : 'error',
          details: {
            canRead: !readError,
            canWrite: !writeError,
            readError: readError?.message,
            writeError: writeError?.message,
            testPropertyCreated: !!writeTest?.id
          }
        };
      } catch (error) {
        diagnosticResults.permissions = {
          status: 'error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }

      debug.db('[DIAGNOSTICS] Testing storage permissions...');
      try {
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
        
        diagnosticResults.storage = {
          status: !bucketsError ? 'success' : 'error',
          details: {
            bucketsCount: buckets?.length || 0,
            hasPropertyImagesBucket: buckets?.some(b => b.name === 'property-images'),
            bucketsError: bucketsError?.message,
            buckets: buckets?.map(b => ({ name: b.name, public: b.public }))
          }
        };
      } catch (error) {
        diagnosticResults.storage = {
          status: 'error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }

      debug.db('[DIAGNOSTICS] Testing database schema...');
      try {
        const { data: schemaTest, error: schemaError } = await supabase
          .from('properties')
          .select('*')
          .limit(0);

        diagnosticResults.database = {
          status: !schemaError ? 'success' : 'error',
          details: {
            schemaError: schemaError?.message,
            schemaValid: !schemaError
          }
        };
      } catch (error) {
        diagnosticResults.database = {
          status: 'error',
          details: { error: error instanceof Error ? error.message : 'Unknown error' }
        };
      }

      debug.db('[DIAGNOSTICS] Diagnostics complete:', diagnosticResults);
      setResults(diagnosticResults);
    } catch (error) {
      debug.error('[DIAGNOSTICS] Diagnostics failed:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Property System Diagnostics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button 
            onClick={runDiagnostics} 
            disabled={testing}
            className="w-full"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Running Diagnostics...
              </>
            ) : (
              'Run System Diagnostics'
            )}
          </Button>

          {results && (
            <div className="space-y-3">
              {Object.entries(results).map(([key, result]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium capitalize">{key}</span>
                  </div>
                  <Badge variant={result.status === 'success' ? 'default' : 'destructive'}>
                    {result.status}
                  </Badge>
                </div>
              ))}
              
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">View Detailed Results</summary>
                <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto">
                  {JSON.stringify(results, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyDiagnostics;
