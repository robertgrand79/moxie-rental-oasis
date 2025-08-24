import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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

const testTurnoApiConnection = async (token: string, secret: string, partnerId?: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔍 Testing Turno API connection...');
    console.log('🔧 Using Token ID:', token ? `${token.substring(0, 8)}...` : 'Not provided');
    console.log('🔧 Using Secret Key:', secret ? `${secret.substring(0, 8)}...` : 'Not provided');
    console.log('🔧 Using Partner ID:', partnerId ? `${partnerId.substring(0, 8)}...` : 'Not provided');
    
    // Try Bearer token authentication first (using Secret Key as Bearer token)
    console.log('🔄 Attempting Bearer token authentication...');
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add Partner ID header if provided
    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }
    
    console.log('🔧 Request headers (Bearer):', Object.keys(headers).join(', '));
    
    // Test with properties endpoint using v2 API
    let testResponse = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    // If Bearer fails, try Basic Auth with Token ID:Secret Key
    if (!testResponse.ok && testResponse.status === 401) {
      console.log('🔄 Bearer token failed, trying Basic Auth...');
      const authString = btoa(`${token}:${secret}`);
      headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (partnerId) {
        headers['TBNB-Partner-ID'] = partnerId;
      }
      
      console.log('🔧 Request headers (Basic):', Object.keys(headers).join(', '));
      
      testResponse = await fetch('https://api.turnoverbnb.com/v2/properties', {
        method: 'GET',
        headers,
      });
    }

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

const fetchTurnoProperties = async (token: string, secret: string, partnerId?: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🏠 Fetching properties from Turno API...');
    
    // Try Bearer token authentication first
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }
    
    let response = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    // If Bearer fails, try Basic Auth
    if (!response.ok && response.status === 401) {
      console.log('🔄 Bearer failed for properties, trying Basic Auth...');
      const authString = btoa(`${token}:${secret}`);
      headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (partnerId) {
        headers['TBNB-Partner-ID'] = partnerId;
      }
      
      response = await fetch('https://api.turnoverbnb.com/v2/properties', {
        method: 'GET',
        headers,
      });
    }

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

const fetchTurnoProblems = async (token: string, secret: string, partnerId?: string, since?: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔧 Fetching problems from Turno API...');
    console.log('🔧 Using Token ID:', token ? `${token.substring(0, 8)}...` : 'Not provided');
    console.log('🔧 Using Secret Key:', secret ? `${secret.substring(0, 8)}...` : 'Not provided');
    
    let url = 'https://api.turnoverbnb.com/v2/problems';
    
    if (since) {
      url += `?updated_since=${since}`;
      console.log('🕐 Fetching problems since:', since);
    } else {
      console.log('📥 Fetching all problems');
    }
    
    // Try Bearer token authentication first
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }
    
    console.log('🔧 Request headers (Bearer):', Object.keys(headers).join(', '));
    
    let response = await fetch(url, {
      method: 'GET',
      headers,
    });

    // If Bearer fails, try Basic Auth
    if (!response.ok && response.status === 401) {
      console.log('🔄 Bearer failed for problems, trying Basic Auth...');
      const authString = btoa(`${token}:${secret}`);
      headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (partnerId) {
        headers['TBNB-Partner-ID'] = partnerId;
      }
      
      response = await fetch(url, {
        method: 'GET',
        headers,
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Problems API error: ${response.status} ${response.statusText}`, errorText);
      throw new Error(`Problems API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    console.log('📄 Raw API response:', responseText.substring(0, 200) + '...');
    
    if (!responseText.trim()) {
      console.log('⚠️ Empty response from Turno API');
      return {
        success: true,
        data: { data: [] },
        message: 'No problems found (empty response)'
      };
    }

    let problemsData;
    try {
      problemsData = JSON.parse(responseText);
      
      // Log the structure to understand what we're getting
      console.log('📋 Problems API result structure:', {
        hasData: !!problemsData.data,
        dataType: Array.isArray(problemsData.data) ? 'array' : typeof problemsData.data,
        dataLength: Array.isArray(problemsData.data) ? problemsData.data.length : 'not array',
        keys: Object.keys(problemsData || {}),
        firstItemKeys: problemsData.data && problemsData.data[0] ? Object.keys(problemsData.data[0]) : 'no items'
      });
      
      // Check if we actually have problems in the expected format
      if (!problemsData.data || !Array.isArray(problemsData.data)) {
        console.log('⚠️ API response does not contain expected data array');
        console.log('📄 Full response structure:', JSON.stringify(problemsData, null, 2));
        return {
          success: true,
          data: { data: [] },
          message: 'No problems found (unexpected response format)'
        };
      }
      
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError);
      console.error('Raw response that failed to parse:', responseText);
      throw new Error(`Invalid JSON response from Turno API: ${parseError.message}`);
    }

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

// Create work order from Turno problem
const createWorkOrderFromProblem = async (supabase: any, problem: any, propertyMapping: any, contractors: any[]) => {
  console.log(`🔄 Creating work order from Turno problem ${problem.id}...`);
  
  try {
    // Determine priority based on problem severity/type
    const priority = determinePriorityFromProblem(problem);
    
    // Find best contractor match
    const assignedContractor = findBestContractorMatch(problem, contractors);
    
    // Generate work order data
    const workOrderData = {
      title: problem.title || `Problem at ${propertyMapping?.property_name || 'Property'}`,
      description: problem.description || problem.notes || 'Issue reported via Turno',
      status: 'draft',
      priority: priority,
      property_id: propertyMapping?.property_id,
      contractor_id: assignedContractor?.id,
      turno_problem_id: problem.id,
      turno_property_id: problem.property_id,
      source: 'turno',
      turno_sync_status: 'synced',
      last_turno_sync_at: new Date().toISOString(),
      turno_last_modified: problem.updated_at || problem.created_at,
      scope_of_work: generateScopeFromProblem(problem),
      special_instructions: problem.notes || 'Automatically created from Turno problem'
    };

    // Get authenticated user for created_by
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      .limit(1);
    
    if (!profiles || profiles.length === 0) {
      throw new Error('No admin user found to assign as creator');
    }

    workOrderData.created_by = profiles[0].id;

    // Create work order
    const { data, error } = await supabase
      .from('work_orders')
      .insert([workOrderData])
      .select(`
        *,
        property:properties(*),
        contractor:contractors(*)
      `)
      .single();

    if (error) throw error;

    console.log(`✅ Created work order ${data.work_order_number} from Turno problem ${problem.id}`);
    return data;

  } catch (error) {
    console.error(`❌ Failed to create work order from problem ${problem.id}:`, error);
    throw error;
  }
};

// Helper functions for work order creation
const determinePriorityFromProblem = (problem: any): string => {
  const description = (problem.description || problem.title || '').toLowerCase();
  const urgentKeywords = ['emergency', 'urgent', 'leak', 'flood', 'electrical', 'gas', 'fire', 'security'];
  const highKeywords = ['broken', 'not working', 'repair', 'replace', 'hvac', 'plumbing'];
  
  if (urgentKeywords.some(keyword => description.includes(keyword))) {
    return 'urgent';
  } else if (highKeywords.some(keyword => description.includes(keyword))) {
    return 'high';
  }
  
  return 'medium';
};

const findBestContractorMatch = (problem: any, contractors: any[]): any => {
  if (!contractors || contractors.length === 0) return null;
  
  const description = (problem.description || problem.title || '').toLowerCase();
  
  // Try to match based on specialties
  for (const contractor of contractors) {
    if (contractor.specialties && Array.isArray(contractor.specialties)) {
      for (const specialty of contractor.specialties) {
        if (description.includes(specialty.toLowerCase())) {
          return contractor;
        }
      }
    }
  }
  
  // Return first active contractor as fallback
  return contractors.find(c => c.is_active) || contractors[0];
};

const generateScopeFromProblem = (problem: any): string => {
  const baseScope = problem.description || problem.title || 'Address reported issue';
  return `${baseScope}\n\nOriginal Turno Problem ID: ${problem.id}`;
};

// Sync work order status to Turno
const syncStatusToTurno = async (supabase: any, token: string, secret: string, partnerId: string, workOrderId: string) => {
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

    // Update Turno problem status - try Bearer first, then Basic Auth
    let headers: Record<string, string> = {
      'Authorization': `Bearer ${secret}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }
    
    let response = await fetch(`https://api.turnoverbnb.com/v2/problems/${workOrder.turno_problem_id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: turnoStatus,
        notes: `Status updated via work order #${workOrder.work_order_number}`
      })
    });

    // If Bearer fails, try Basic Auth
    if (!response.ok && response.status === 401) {
      console.log('🔄 Bearer failed for status sync, trying Basic Auth...');
      const authString = btoa(`${token}:${secret}`);
      headers = {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      };
      
      if (partnerId) {
        headers['TBNB-Partner-ID'] = partnerId;
      }
      
      response = await fetch(`https://api.turnoverbnb.com/v2/problems/${workOrder.turno_problem_id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          status: turnoStatus,
          notes: `Status updated via work order #${workOrder.work_order_number}`
        })
      });
    }

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

// Enhanced sync problems from Turno with new turno_problems table
const syncProblemsFromTurno = async (supabase: any, token: string, secret: string, partnerId: string, createWorkOrders = false) => {
  console.log('🔄 Syncing problems from Turno...');
  
  try {
    console.log('🔄 Syncing problems from Turno...');
    
    // Fetch recent problems from Turno (last 7 days for updates, all for bulk import)
    const since = createWorkOrders ? null : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const problemsResult = await fetchTurnoProblems(token, secret, partnerId, since);
    
    console.log('📋 Problems API result:', { success: problemsResult.success, hasData: !!problemsResult.data });
    
    if (!problemsResult.success) {
      console.error('❌ Failed to fetch problems from Turno:', problemsResult.error);
      throw new Error(`Failed to fetch problems: ${problemsResult.error}`);
    }

    // Safely handle problems data with proper validation
    const problemsData = problemsResult.data;
    if (!problemsData || typeof problemsData !== 'object') {
      console.error('❌ Invalid problems data structure:', problemsData);
      throw new Error('Invalid response structure from Turno API');
    }

    const problems = Array.isArray(problemsData.data) ? problemsData.data : 
                    Array.isArray(problemsData) ? problemsData : [];
    
    console.log(`✅ Found ${problems.length} problems in Turno`);
    let syncedCount = 0;
    let conflictCount = 0;
    let createdCount = 0;

    // Get property mappings for future work order creation
    const { data: mappings } = await supabase
      .from('turno_property_mapping')
      .select('*')
      .eq('is_active', true);

    const { data: contractors } = await supabase
      .from('contractors')
      .select('*')
      .eq('is_active', true);

    for (const problem of problems) {
      try {
        // Check if we already have this problem in our database
        const { data: existingProblem } = await supabase
          .from('turno_problems')
          .select('*')
          .eq('turno_problem_id', problem.id)
          .maybeSingle();

        // Get property mapping for property data
        const propertyMapping = mappings?.find(m => m.turno_property_id === problem.property_id);

        // Prepare problem data for upsert
        const problemData = {
          turno_problem_id: problem.id,
          turno_property_id: problem.property_id,
          title: problem.title || 'Untitled Problem',
          description: problem.description || problem.notes,
          status: problem.status || 'open',
          priority: determinePriorityFromProblem(problem),
          category: problem.category || 'general',
          room_location: problem.room_location || problem.location,
          reporter_name: problem.reporter_name,
          reporter_email: problem.reporter_email,
          reporter_phone: problem.reporter_phone,
          property_address: propertyMapping?.property_name || problem.property_address,
          turno_created_at: problem.created_at,
          turno_updated_at: problem.updated_at,
          sync_status: 'synced',
          last_sync_at: new Date().toISOString(),
          metadata: {
            turno_raw_data: problem,
            property_mapping_id: propertyMapping?.id
          }
        };

        if (existingProblem) {
          // Update existing problem
          const { error } = await supabase
            .from('turno_problems')
            .update(problemData)
            .eq('id', existingProblem.id);

          if (error) {
            console.error(`❌ Failed to update problem ${problem.id}:`, error);
          } else {
            syncedCount++;
            console.log(`✅ Updated problem ${problem.id}`);
          }
        } else {
          // Create new problem
          const { error } = await supabase
            .from('turno_problems')
            .insert([problemData]);

          if (error) {
            console.error(`❌ Failed to create problem ${problem.id}:`, error);
          } else {
            createdCount++;
            console.log(`✅ Created new problem ${problem.id}`);
          }
        }

        // If createWorkOrders is true, also create work orders for new problems
        if (createWorkOrders && !existingProblem && propertyMapping) {
          try {
            await createWorkOrderFromProblem(supabase, problem, propertyMapping, contractors || []);
            console.log(`✅ Created work order from Turno problem ${problem.id}`);
          } catch (createError) {
            console.error(`❌ Failed to create work order from problem ${problem.id}:`, createError);
          }
        }

      } catch (error) {
        console.error(`❌ Error processing Turno problem ${problem.id}:`, error);
        conflictCount++;
      }
    }

    console.log(`✅ Sync complete: ${syncedCount} updated, ${conflictCount} conflicts, ${createdCount} created`);
    return { 
      success: true, 
      synced: syncedCount, 
      conflicts: conflictCount, 
      created: createdCount,
      total: problems.length 
    };

  } catch (error) {
    console.error('❌ Failed to sync problems from Turno:', error);
    throw error;
  }
};

// Helper function to create sync log entry
const createSyncLog = async (supabase: any, syncType: string, metadata: any = {}) => {
  try {
    const { data, error } = await supabase
      .from('turno_sync_log')
      .insert({
        sync_type: syncType,
        status: 'pending',
        metadata
      })
      .select()
      .single();
    
    if (error) {
      console.error('Failed to create sync log:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Exception creating sync log:', error);
    return null;
  }
};

// Helper function to update sync log entry
const updateSyncLog = async (supabase: any, logId: string, updates: any) => {
  try {
    if (!logId) return;
    
    const { error } = await supabase
      .from('turno_sync_log')
      .update({
        ...updates,
        completed_at: new Date().toISOString(),
        duration_ms: updates.duration_ms || 0
      })
      .eq('id', logId);
    
    if (error) {
      console.error('Failed to update sync log:', error);
    }
  } catch (error) {
    console.error('Exception updating sync log:', error);
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  let syncLog: any = null;

  try {
    const url = new URL(req.url);
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const turnoApiToken = Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = Deno.env.get('TURNO_API_SECRET');
    const turnoPartnerId = Deno.env.get('TURNO_PARTNER_ID');

    if (!turnoApiToken || !turnoApiSecret) {
      throw new Error('Turno API credentials not configured');
    }

    console.log('🔧 Using Turno Partner ID:', turnoPartnerId ? `${turnoPartnerId.substring(0, 8)}...` : 'Not configured');

    if (!validateApiCredentials(turnoApiToken, turnoApiSecret)) {
      throw new Error('Invalid Turno API credentials format');
    }

    // Handle different sync endpoints based on pathname and method
    if (url.pathname.endsWith('/properties')) {
      // Properties endpoint - delegate to properties function
      return new Response(JSON.stringify({
        success: false,
        error: 'Properties endpoint should be called via turno-sync/properties function'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    if (req.method === 'POST') {
      let requestBody: any = {};
      
      // Only try to parse JSON if there's content in the request
      const contentLength = req.headers.get('content-length');
      const hasContent = contentLength && parseInt(contentLength) > 0;
      
      if (hasContent) {
        try {
          const text = await req.text();
          if (text.trim()) {
            requestBody = JSON.parse(text);
          }
        } catch (parseError) {
          console.error('❌ JSON parse error:', parseError);
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Invalid JSON in request body' 
          }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }
      }
      
      // Handle actions based on request body action parameter
      const { action } = requestBody;
      
      console.log('🎯 Action requested:', action);
      
      // Sync specific work order status to Turno
      if (action === 'sync-status') {
        const { workOrderId } = requestBody;
        if (!workOrderId) {
          return new Response(JSON.stringify({ success: false, error: 'workOrderId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders }
          });
        }

        const result = await syncStatusToTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, workOrderId);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Sync all recent problems from Turno
      if (action === 'sync-problems') {
        const { createWorkOrders = false } = requestBody;
        const result = await syncProblemsFromTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, createWorkOrders);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Bulk import Turno problems as work orders
      if (action === 'import-problems') {
        const result = await syncProblemsFromTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, true);
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }

      // Full bidirectional sync
      if (action === 'sync-full') {
        const problemsResult = await syncProblemsFromTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, false);
        
        // Sync pending work orders to Turno
        const { data: pendingWorkOrders } = await supabaseClient
          .from('work_orders')
          .select('id')
          .not('turno_problem_id', 'is', null)
          .or('last_turno_sync_at.is.null,last_turno_sync_at.lt.' + new Date(Date.now() - 60 * 60 * 1000).toISOString());

        let statusSyncCount = 0;
        for (const wo of pendingWorkOrders || []) {
          try {
            await syncStatusToTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, wo.id);
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
      
      // If no valid action provided, fall through to default behavior
    }

    // Default: API connectivity test (existing functionality)
    console.log('🏨 Starting Turno API connectivity test...');
    
    const connectionTest = await testTurnoApiConnection(turnoApiToken, turnoApiSecret, turnoPartnerId);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    const propertiesResult = await fetchTurnoProperties(turnoApiToken, turnoApiSecret, turnoPartnerId);
    const problemsResult = await fetchTurnoProblems(turnoApiToken, turnoApiSecret, turnoPartnerId);

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
    
    // Get credentials for debugging (safely handle undefined case)
    const turnoApiToken = Deno.env.get('TURNO_API_TOKEN');
    const turnoApiSecret = Deno.env.get('TURNO_API_SECRET');
    const turnoPartnerId = Deno.env.get('TURNO_PARTNER_ID');
    
    // Enhanced error logging
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      turnoApiToken: turnoApiToken ? `${turnoApiToken.substring(0, 8)}...` : 'missing',
      turnoApiSecret: turnoApiSecret ? `${turnoApiSecret.substring(0, 8)}...` : 'missing',
      turnoPartnerId: turnoPartnerId ? `${turnoPartnerId.substring(0, 8)}...` : 'missing'
    });
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      message: 'Turno sync operation failed',
      debug: {
        errorType: error.name,
        hasCredentials: !!(turnoApiToken && turnoApiSecret),
        hasPartnerId: !!turnoPartnerId
      }
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);