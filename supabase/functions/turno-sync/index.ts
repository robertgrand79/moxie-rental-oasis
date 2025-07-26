import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Status mapping between work orders and Turno problems
const STATUS_MAPPING = {
  workOrderToTurno: {
    'draft': 'reported',
    'sent': 'assigned', 
    'acknowledged': 'in_progress',
    'in_progress': 'in_progress',
    'completed': 'resolved',
    'paid': 'closed',
    'cancelled': 'cancelled'
  },
  turnoToWorkOrder: {
    'reported': 'draft',
    'assigned': 'sent',
    'in_progress': 'in_progress', 
    'resolved': 'completed',
    'closed': 'paid',
    'cancelled': 'cancelled'
  }
};

interface TurnoApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

const validateApiCredentials = (token: string, secret: string): boolean => {
  return token && token.length > 10 && secret && secret.length > 10;
};

const testTurnoApiConnection = async (token: string, secret: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔍 Testing Turno API connection...');
    
    // Create basic auth header with token and secret
    const authString = btoa(`${token}:${secret}`);
    
    // Test with a simple API call to verify authentication
    // According to Turno docs, we'll try the properties endpoint first
    const testResponse = await fetch('https://api.turnoverbnb.com/v1/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ Turno API test failed: ${testResponse.status} ${testResponse.statusText}`, errorText);
      
      if (testResponse.status === 401) {
        return {
          success: false,
          error: 'Invalid API credentials. Please check your Turno API Token and Secret in the Supabase dashboard.'
        };
      } else if (testResponse.status === 403) {
        return {
          success: false,
          error: 'API credentials lack required permissions. Please ensure your Turno API credentials have read access to properties and problems.'
        };
      } else if (testResponse.status === 429) {
        return {
          success: false,
          error: 'Rate limit exceeded. Please try again in a few minutes.'
        };
      } else {
        return {
          success: false,
          error: `Turno API error: ${testResponse.status} ${testResponse.statusText}`
        };
      }
    }

    const responseData = await testResponse.json();
    console.log('✅ Turno API connection test successful');
    
    return { 
      success: true, 
      data: responseData,
      message: 'Successfully connected to Turno API'
    };
  } catch (error) {
    console.error('❌ Turno API connection test failed:', error);
    return {
      success: false,
      error: `Connection failed: ${error.message}`
    };
  }
};

const fetchTurnoProperties = async (token: string, secret: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🏠 Fetching properties from Turno API...');
    
    const authString = btoa(`${token}:${secret}`);
    
    const response = await fetch('https://api.turnoverbnb.com/v1/properties', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Properties API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Properties API error: ${response.status} ${response.statusText}`);
    }

    const propertiesData = await response.json();
    console.log(`✅ Found ${propertiesData.data?.length || 0} properties in Turno`);
    
    return {
      success: true,
      data: propertiesData,
      message: `Successfully fetched ${propertiesData.data?.length || 0} properties`
    };
  } catch (error) {
    console.error('❌ Error fetching Turno properties:', error);
    return {
      success: false,
      error: `Failed to fetch properties: ${error.message}`
    };
  }
};

const fetchTurnoProblems = async (token: string, secret: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔧 Fetching problems from Turno API...');
    
    const authString = btoa(`${token}:${secret}`);
    
    const response = await fetch('https://api.turnoverbnb.com/v1/problems', {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Problems API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Problems API error: ${response.status} ${response.statusText}`);
    }

    const problemsData = await response.json();
    console.log(`✅ Found ${problemsData.data?.length || 0} problems in Turno`);
    
    return {
      success: true,
      data: problemsData,
      message: `Successfully fetched ${problemsData.data?.length || 0} problems`
    };
  } catch (error) {
    console.error('❌ Error fetching Turno problems:', error);
    return {
      success: false,
      error: `Failed to fetch problems: ${error.message}`
    };
  }
};

// Sync work order status to Turno
const syncStatusToTurno = async (supabase: any, token: string, secret: string, workOrderId: string) => {
  console.log(`🔄 Syncing work order ${workOrderId} status to Turno...`);
  
  try {
    // Get work order details
    const { data: workOrder, error: woError } = await supabase
      .from('work_orders')
      .select('*, property:properties(*)')
      .eq('id', workOrderId)
      .single();

    if (woError || !workOrder) {
      throw new Error(`Work order not found: ${woError?.message}`);
    }

    if (!workOrder.turno_problem_id) {
      throw new Error('Work order is not linked to a Turno problem');
    }

    // Map work order status to Turno status
    const turnoStatus = STATUS_MAPPING.workOrderToTurno[workOrder.status as keyof typeof STATUS_MAPPING.workOrderToTurno];
    if (!turnoStatus) {
      throw new Error(`No Turno status mapping for work order status: ${workOrder.status}`);
    }

    // Update Turno problem status
    const authString = btoa(`${token}:${secret}`);
    const response = await fetch(`https://api.turnoverbnb.com/v1/problems/${workOrder.turno_problem_id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        status: turnoStatus,
        notes: `Status updated via work order #${workOrder.work_order_number}`
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Turno API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const turnoResponse = await response.json();

    // Update work order sync timestamp and log
    await supabase.from('work_orders')
      .update({ 
        last_turno_sync_at: new Date().toISOString(),
        sync_conflict_reason: null 
      })
      .eq('id', workOrderId);

    // Log sync operation
    await supabase.from('turno_sync_log').insert({
      work_order_id: workOrderId,
      sync_direction: 'to_turno',
      sync_status: 'success',
      status_before: workOrder.status,
      status_after: workOrder.status,
      sync_details: { turno_status: turnoStatus },
      turno_api_response: turnoResponse
    });

    console.log(`✅ Successfully synced work order ${workOrderId} to Turno`);
    return { success: true, turno_status: turnoStatus, response: turnoResponse };

  } catch (error) {
    console.error(`❌ Failed to sync work order ${workOrderId} to Turno:`, error);
    
    // Log failed sync
    await supabase.from('turno_sync_log').insert({
      work_order_id: workOrderId,
      sync_direction: 'to_turno',
      sync_status: 'failed',
      error_message: error.message,
      sync_details: { attempted_at: new Date().toISOString() }
    });

    throw error;
  }
};

// Sync problems from Turno to work orders
const syncProblemsFromTurno = async (supabase: any, token: string, secret: string) => {
  console.log('🔄 Syncing problems from Turno...');
  
  try {
    const authString = btoa(`${token}:${secret}`);
    
    // Fetch recent problems from Turno (last 24 hours)
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const response = await fetch(`https://api.turnoverbnb.com/v1/problems?updated_since=${since}`, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Turno API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const problemsData = await response.json();
    const problems = problemsData.data || [];
    let syncedCount = 0;
    let conflictCount = 0;

    for (const problem of problems) {
      try {
        // Check if we have a work order for this problem
        const { data: existingWO } = await supabase
          .from('work_orders')
          .select('*')
          .eq('turno_problem_id', problem.id)
          .single();

        if (existingWO) {
          // Update existing work order if status changed
          const workOrderStatus = STATUS_MAPPING.turnoToWorkOrder[problem.status as keyof typeof STATUS_MAPPING.turnoToWorkOrder];
          
          if (workOrderStatus && existingWO.status !== workOrderStatus) {
            // Check for conflicts (manual override)
            if (existingWO.turno_status_override) {
              console.log(`⚠️ Skipping sync for WO ${existingWO.id} - manual override active`);
              continue;
            }

            // Check timestamps to determine which is more recent
            const turnoModified = new Date(problem.updated_at || problem.created_at);
            const woModified = new Date(existingWO.updated_at);

            if (turnoModified > woModified) {
              // Turno is more recent, update work order
              await supabase.from('work_orders')
                .update({
                  status: workOrderStatus,
                  last_turno_sync_at: new Date().toISOString(),
                  turno_last_modified: problem.updated_at,
                  sync_conflict_reason: null
                })
                .eq('id', existingWO.id);

              // Log sync
              await supabase.from('turno_sync_log').insert({
                work_order_id: existingWO.id,
                sync_direction: 'from_turno',
                sync_status: 'success',
                status_before: existingWO.status,
                status_after: workOrderStatus,
                sync_details: { turno_problem: problem }
              });

              syncedCount++;
              console.log(`✅ Updated work order ${existingWO.id} from Turno problem ${problem.id}`);
            } else {
              // Work order is more recent, potential conflict
              conflictCount++;
              await supabase.from('work_orders')
                .update({
                  sync_conflict_reason: `Status conflict: WO(${existingWO.status}) vs Turno(${problem.status})`
                })
                .eq('id', existingWO.id);

              console.log(`⚠️ Status conflict detected for work order ${existingWO.id}`);
            }
          }
        }
      } catch (error) {
        console.error(`❌ Error processing Turno problem ${problem.id}:`, error);
      }
    }

    console.log(`✅ Sync complete: ${syncedCount} updated, ${conflictCount} conflicts`);
    return { success: true, synced: syncedCount, conflicts: conflictCount, total: problems.length };

  } catch (error) {
    console.error('❌ Failed to sync problems from Turno:', error);
    throw error;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const turnoApiToken = Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = Deno.env.get('TURNO_API_SECRET');

    if (!turnoApiToken || !turnoApiSecret) {
      throw new Error('Turno API credentials not configured');
    }

    if (!validateApiCredentials(turnoApiToken, turnoApiSecret)) {
      throw new Error('Invalid Turno API credentials format');
    }

    // Handle different sync endpoints
    if (req.method === 'POST') {
      const requestBody = await req.json();
      
      // Sync specific work order status to Turno
      if (url.pathname.endsWith('/sync-status')) {
        const { workOrderId } = requestBody;
        if (!workOrderId) {
          return new Response(JSON.stringify({ success: false, error: 'workOrderId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const result = await syncStatusToTurno(supabaseClient, turnoApiToken, turnoApiSecret, workOrderId);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Sync all recent problems from Turno
      if (url.pathname.endsWith('/sync-problems')) {
        const result = await syncProblemsFromTurno(supabaseClient, turnoApiToken, turnoApiSecret);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Full bidirectional sync
      if (url.pathname.endsWith('/sync-full')) {
        const problemsResult = await syncProblemsFromTurno(supabaseClient, turnoApiToken, turnoApiSecret);
        
        // Sync pending work orders to Turno
        const { data: pendingWorkOrders } = await supabaseClient
          .from('work_orders')
          .select('id')
          .not('turno_problem_id', 'is', null)
          .or('last_turno_sync_at.is.null,last_turno_sync_at.lt.' + new Date(Date.now() - 60 * 60 * 1000).toISOString());

        let statusSyncCount = 0;
        for (const wo of pendingWorkOrders || []) {
          try {
            await syncStatusToTurno(supabaseClient, turnoApiToken, turnoApiSecret, wo.id);
            statusSyncCount++;
          } catch (error) {
            console.error(`Failed to sync work order ${wo.id}:`, error);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          problemsSync: problemsResult,
          statusSync: { synced: statusSyncCount, total: pendingWorkOrders?.length || 0 }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    }

    // Default: API connectivity test (existing functionality)
    console.log('🏨 Starting Turno API connectivity test...');
    
    const connectionTest = await testTurnoApiConnection(turnoApiToken, turnoApiSecret);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    const propertiesResult = await fetchTurnoProperties(turnoApiToken, turnoApiSecret);
    const problemsResult = await fetchTurnoProblems(turnoApiToken, turnoApiSecret);

    const result = {
      success: true,
      message: 'Turno API integration test completed successfully',
      data: {
        connection: connectionTest.data,
        properties: propertiesResult.success ? {
          count: propertiesResult.data?.data?.length || 0,
          sample: propertiesResult.data?.data?.slice(0, 2) || []
        } : { error: propertiesResult.error },
        problems: problemsResult.success ? {
          count: problemsResult.data?.data?.length || 0,
          sample: problemsResult.data?.data?.slice(0, 2) || []
        } : { error: problemsResult.error }
      },
      stats: {
        totalProperties: propertiesResult.data?.data?.length || 0,
        totalProblems: problemsResult.data?.data?.length || 0,
        connectionStatus: 'connected'
      }
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('❌ Turno sync error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Turno sync operation failed'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);