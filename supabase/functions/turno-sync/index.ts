import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { decryptApiKey, isEncrypted } from "../_shared/encryption.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

const STATUS_MAPPING = {
  workOrderToTurno: {
    draft: 'reported',
    sent: 'assigned',
    acknowledged: 'in_progress',
    in_progress: 'in_progress',
    completed: 'resolved',
    paid: 'closed',
    cancelled: 'cancelled',
  },
  turnoToWorkOrder: {
    reported: 'draft',
    assigned: 'sent',
    in_progress: 'in_progress',
    resolved: 'completed',
    closed: 'paid',
    cancelled: 'cancelled',
  },
};

interface TurnoApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

const validateApiCredentials = (token: string, secret: string): boolean => {
  return Boolean(token && token.length > 10 && secret && secret.length > 10);
};

async function decryptIfNeeded(value: string | null): Promise<string | null> {
  if (!value) return null;
  if (isEncrypted(value)) {
    return await decryptApiKey(value);
  }
  return value;
}

async function resolveOrganizationId(supabase: any, requestBody: any, url: URL): Promise<string | null> {
  if (requestBody?.organizationId) {
    return requestBody.organizationId;
  }

  const queryOrgId = url.searchParams.get('organizationId');
  if (queryOrgId) {
    return queryOrgId;
  }

  if (requestBody?.propertyId) {
    const { data: property } = await supabase
      .from('properties')
      .select('organization_id')
      .eq('id', requestBody.propertyId)
      .single();
    return property?.organization_id || null;
  }

  if (requestBody?.workOrderId) {
    const { data: workOrder } = await supabase
      .from('work_orders')
      .select('property_id')
      .eq('id', requestBody.workOrderId)
      .single();

    if (workOrder?.property_id) {
      const { data: property } = await supabase
        .from('properties')
        .select('organization_id')
        .eq('id', workOrder.property_id)
        .single();
      return property?.organization_id || null;
    }
  }

  return null;
}

async function loadTurnoCredentialsForOrganization(supabase: any, organizationId: string) {
  const { data: org, error } = await supabase
    .from('organizations')
    .select('turno_api_token, turno_api_secret, turno_partner_id')
    .eq('id', organizationId)
    .single();

  if (error) {
    throw new Error('Failed to fetch organization Turno settings');
  }

  const token = await decryptIfNeeded(org?.turno_api_token);
  const secret = await decryptIfNeeded(org?.turno_api_secret);
  const partnerId = await decryptIfNeeded(org?.turno_partner_id);

  if (!token || !secret) {
    throw new Error('This organization must connect its own Turno API token and secret before syncing.');
  }

  if (!validateApiCredentials(token, secret)) {
    throw new Error('Invalid Turno API credentials format');
  }

  return { token, secret, partnerId: partnerId || undefined };
}

const testTurnoApiConnection = async (token: string, secret: string, partnerId?: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔍 Testing Turno API connection...');
    let headers: Record<string, string> = {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }

    let testResponse = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    if (!testResponse.ok && testResponse.status === 401) {
      const authString = btoa(`${token}:${secret}`);
      headers = {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      };

      if (partnerId) {
        headers['TBNB-Partner-ID'] = partnerId;
      }

      testResponse = await fetch('https://api.turnoverbnb.com/v2/properties', {
        method: 'GET',
        headers,
      });
    }

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error(`❌ Turno API test failed: ${testResponse.status} ${testResponse.statusText}`, errorText);

      if (testResponse.status === 401) {
        return { success: false, error: 'Invalid Turno API credentials.' };
      }
      if (testResponse.status === 403) {
        return { success: false, error: 'Turno API credentials do not have the required permissions.' };
      }
      if (testResponse.status === 429) {
        return { success: false, error: 'Turno API rate limit exceeded. Please try again later.' };
      }
      return { success: false, error: `Turno API error: ${testResponse.status} ${testResponse.statusText}` };
    }

    const responseData = await testResponse.json();
    return { success: true, data: responseData, message: 'Successfully connected to Turno API' };
  } catch (error) {
    console.error('❌ Turno API connection test failed:', error);
    return { success: false, error: `Connection failed: ${error.message}` };
  }
};

const fetchTurnoProperties = async (token: string, secret: string, partnerId?: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🏠 Fetching properties from Turno API...');

    let headers: Record<string, string> = {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }

    let response = await fetch('https://api.turnoverbnb.com/v2/properties', {
      method: 'GET',
      headers,
    });

    if (!response.ok && response.status === 401) {
      const authString = btoa(`${token}:${secret}`);
      headers = {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
      throw new Error(`Properties API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const propertiesData = await response.json();
    return {
      success: true,
      data: propertiesData,
      message: `Successfully fetched ${propertiesData.data?.length || 0} properties`,
    };
  } catch (error) {
    console.error('❌ Error fetching Turno properties:', error);
    return { success: false, error: `Failed to fetch properties: ${error.message}` };
  }
};

const fetchTurnoProblems = async (token: string, secret: string, partnerId?: string, since?: string): Promise<TurnoApiResponse> => {
  try {
    console.log('🔧 Fetching problems from Turno API...');

    let url = 'https://api.turnoverbnb.com/v2/problems';
    if (since) {
      url += `?updated_since=${since}`;
    }

    let headers: Record<string, string> = {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }

    let response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok && response.status === 401) {
      const authString = btoa(`${token}:${secret}`);
      headers = {
        Authorization: `Basic ${authString}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
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
      throw new Error(`Problems API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const responseText = await response.text();
    if (!responseText.trim()) {
      return { success: true, data: { data: [] }, message: 'No problems found (empty response)' };
    }

    const problemsData = JSON.parse(responseText);
    if (!problemsData.data || !Array.isArray(problemsData.data)) {
      return { success: true, data: { data: [] }, message: 'No problems found (unexpected response format)' };
    }

    return {
      success: true,
      data: problemsData,
      message: `Successfully fetched ${problemsData.data?.length || 0} problems`,
    };
  } catch (error) {
    console.error('❌ Error fetching Turno problems:', error);
    return { success: false, error: `Failed to fetch problems: ${error.message}` };
  }
};

const determinePriorityFromProblem = (problem: any): string => {
  const description = (problem.description || problem.title || '').toLowerCase();
  const urgentKeywords = ['emergency', 'urgent', 'leak', 'flood', 'electrical', 'gas', 'fire', 'security'];
  const highKeywords = ['broken', 'not working', 'repair', 'replace', 'hvac', 'plumbing'];

  if (urgentKeywords.some((keyword) => description.includes(keyword))) {
    return 'urgent';
  }
  if (highKeywords.some((keyword) => description.includes(keyword))) {
    return 'high';
  }

  return 'medium';
};

const findBestContractorMatch = (problem: any, contractors: any[]): any => {
  if (!contractors || contractors.length === 0) return null;

  const description = (problem.description || problem.title || '').toLowerCase();

  for (const contractor of contractors) {
    if (contractor.specialties && Array.isArray(contractor.specialties)) {
      for (const specialty of contractor.specialties) {
        if (description.includes(String(specialty).toLowerCase())) {
          return contractor;
        }
      }
    }
  }

  return contractors.find((contractor) => contractor.is_active) || contractors[0];
};

const generateScopeFromProblem = (problem: any): string => {
  const baseScope = problem.description || problem.title || 'Address reported issue';
  return `${baseScope}\n\nOriginal Turno Problem ID: ${problem.id}`;
};

const createWorkOrderFromProblem = async (supabase: any, problem: any, propertyMapping: any, contractors: any[]) => {
  console.log(`🔄 Creating work order from Turno problem ${problem.id}...`);

  const priority = determinePriorityFromProblem(problem);
  const assignedContractor = findBestContractorMatch(problem, contractors);

  const workOrderData: any = {
    title: problem.title || `Problem at ${propertyMapping?.property_name || 'Property'}`,
    description: problem.description || problem.notes || 'Issue reported via Turno',
    status: 'draft',
    priority,
    property_id: propertyMapping?.property_id,
    contractor_id: assignedContractor?.id,
    turno_problem_id: problem.id,
    turno_property_id: problem.property_id,
    source: 'turno',
    turno_sync_status: 'synced',
    last_turno_sync_at: new Date().toISOString(),
    turno_last_modified: problem.updated_at || problem.created_at,
    scope_of_work: generateScopeFromProblem(problem),
    special_instructions: problem.notes || 'Automatically created from Turno problem',
  };

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id')
    .eq('role', 'admin')
    .limit(1);

  if (!profiles || profiles.length === 0) {
    throw new Error('No admin user found to assign as creator');
  }

  workOrderData.created_by = profiles[0].id;

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
  return data;
};

const syncStatusToTurno = async (supabase: any, token: string, secret: string, partnerId: string | undefined, workOrderId: string) => {
  console.log(`🔄 Syncing work order ${workOrderId} status to Turno...`);

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

  const turnoStatus = STATUS_MAPPING.workOrderToTurno[workOrder.status as keyof typeof STATUS_MAPPING.workOrderToTurno];
  if (!turnoStatus) {
    throw new Error(`No Turno status mapping for work order status: ${workOrder.status}`);
  }

  let headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (partnerId) {
    headers['TBNB-Partner-ID'] = partnerId;
  }

  let response = await fetch(`https://api.turnoverbnb.com/v2/problems/${workOrder.turno_problem_id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({
      status: turnoStatus,
      notes: `Status updated via work order #${workOrder.work_order_number}`,
    }),
  });

  if (!response.ok && response.status === 401) {
    const authString = btoa(`${token}:${secret}`);
    headers = {
      Authorization: `Basic ${authString}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (partnerId) {
      headers['TBNB-Partner-ID'] = partnerId;
    }

    response = await fetch(`https://api.turnoverbnb.com/v2/problems/${workOrder.turno_problem_id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        status: turnoStatus,
        notes: `Status updated via work order #${workOrder.work_order_number}`,
      }),
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Turno API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  const turnoResponse = await response.json();

  await supabase
    .from('work_orders')
    .update({ last_turno_sync_at: new Date().toISOString(), sync_conflict_reason: null })
    .eq('id', workOrderId);

  await supabase.from('turno_sync_log').insert({
    work_order_id: workOrderId,
    sync_direction: 'to_turno',
    sync_status: 'success',
    status_before: workOrder.status,
    status_after: workOrder.status,
    sync_details: { turno_status: turnoStatus },
    turno_api_response: turnoResponse,
  });

  return { success: true, turno_status: turnoStatus, response: turnoResponse };
};

const syncProblemsFromTurno = async (
  supabase: any,
  organizationId: string,
  token: string,
  secret: string,
  partnerId: string | undefined,
  createWorkOrders = false,
) => {
  console.log('🔄 Syncing problems from Turno...');

  const since = createWorkOrders ? null : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const problemsResult = await fetchTurnoProblems(token, secret, partnerId, since);

  if (!problemsResult.success) {
    throw new Error(`Failed to fetch problems: ${problemsResult.error}`);
  }

  const problemsData = problemsResult.data;
  if (!problemsData || typeof problemsData !== 'object') {
    throw new Error('Invalid response structure from Turno API');
  }

  const problems = Array.isArray(problemsData.data)
    ? problemsData.data
    : Array.isArray(problemsData)
      ? problemsData
      : [];

  let syncedCount = 0;
  let conflictCount = 0;
  let createdCount = 0;

  const { data: mappings } = await supabase
    .from('turno_property_mapping')
    .select('*')
    .eq('organization_id', organizationId)
    .eq('is_active', true);

  const { data: contractors } = await supabase
    .from('contractors')
    .select('*')
    .eq('is_active', true);

  for (const problem of problems) {
    try {
      const { data: existingProblem } = await supabase
        .from('turno_problems')
        .select('*')
        .eq('turno_problem_id', problem.id)
        .maybeSingle();

      const propertyMapping = mappings?.find((mapping) => mapping.turno_property_id === problem.property_id);

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
          property_mapping_id: propertyMapping?.id,
          organization_id: organizationId,
        },
      };

      if (existingProblem) {
        const { error } = await supabase
          .from('turno_problems')
          .update(problemData)
          .eq('id', existingProblem.id);

        if (error) {
          console.error(`❌ Failed to update problem ${problem.id}:`, error);
        } else {
          syncedCount++;
        }
      } else {
        const { error } = await supabase
          .from('turno_problems')
          .insert([problemData]);

        if (error) {
          console.error(`❌ Failed to create problem ${problem.id}:`, error);
        } else {
          createdCount++;
        }
      }

      if (createWorkOrders && !existingProblem && propertyMapping) {
        try {
          await createWorkOrderFromProblem(supabase, problem, propertyMapping, contractors || []);
        } catch (createError) {
          console.error(`❌ Failed to create work order from problem ${problem.id}:`, createError);
        }
      }
    } catch (error) {
      console.error(`❌ Error processing Turno problem ${problem.id}:`, error);
      conflictCount++;
    }
  }

  return {
    success: true,
    synced: syncedCount,
    conflicts: conflictCount,
    created: createdCount,
    total: problems.length,
    organizationId,
  };
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

    let requestBody: any = {};
    const contentLength = req.headers.get('content-length');
    const hasContent = contentLength && parseInt(contentLength) > 0;

    if (hasContent) {
      try {
        const text = await req.text();
        if (text.trim()) {
          requestBody = JSON.parse(text);
        }
      } catch {
        return new Response(JSON.stringify({ success: false, error: 'Invalid JSON in request body' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    const organizationId = await resolveOrganizationId(supabaseClient, requestBody, url);
    if (!organizationId) {
      throw new Error('Organization ID is required for Turno sync');
    }

    const credentials = await loadTurnoCredentialsForOrganization(supabaseClient, organizationId);
    const { token: turnoApiToken, secret: turnoApiSecret, partnerId: turnoPartnerId } = credentials;

    if (url.pathname.endsWith('/properties')) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Properties endpoint should be called via turno-sync-properties function',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    if (req.method === 'POST') {
      const { action } = requestBody;
      console.log('🎯 Action requested:', action, 'for organization:', organizationId);

      if (action === 'sync-status') {
        const { workOrderId } = requestBody;
        if (!workOrderId) {
          return new Response(JSON.stringify({ success: false, error: 'workOrderId required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
          });
        }

        const result = await syncStatusToTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, workOrderId);
        return new Response(JSON.stringify({ ...result, organizationId }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (action === 'sync-problems') {
        const { createWorkOrders = false } = requestBody;
        const result = await syncProblemsFromTurno(
          supabaseClient,
          organizationId,
          turnoApiToken,
          turnoApiSecret,
          turnoPartnerId,
          createWorkOrders,
        );
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (action === 'import-problems') {
        const result = await syncProblemsFromTurno(
          supabaseClient,
          organizationId,
          turnoApiToken,
          turnoApiSecret,
          turnoPartnerId,
          true,
        );
        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }

      if (action === 'sync-full') {
        const problemsResult = await syncProblemsFromTurno(
          supabaseClient,
          organizationId,
          turnoApiToken,
          turnoApiSecret,
          turnoPartnerId,
          false,
        );

        const { data: pendingWorkOrders } = await supabaseClient
          .from('work_orders')
          .select('id')
          .not('turno_problem_id', 'is', null)
          .or('last_turno_sync_at.is.null,last_turno_sync_at.lt.' + new Date(Date.now() - 60 * 60 * 1000).toISOString());

        let statusSyncCount = 0;
        for (const workOrder of pendingWorkOrders || []) {
          try {
            await syncStatusToTurno(supabaseClient, turnoApiToken, turnoApiSecret, turnoPartnerId, workOrder.id);
            statusSyncCount++;
          } catch (error) {
            console.error(`Failed to sync work order ${workOrder.id}:`, error);
          }
        }

        return new Response(JSON.stringify({
          success: true,
          organizationId,
          problemsSync: problemsResult,
          statusSync: { synced: statusSyncCount, total: pendingWorkOrders?.length || 0 },
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        });
      }
    }

    const connectionTest = await testTurnoApiConnection(turnoApiToken, turnoApiSecret, turnoPartnerId);
    if (!connectionTest.success) {
      throw new Error(connectionTest.error);
    }

    const propertiesResult = await fetchTurnoProperties(turnoApiToken, turnoApiSecret, turnoPartnerId);
    const problemsResult = await fetchTurnoProblems(turnoApiToken, turnoApiSecret, turnoPartnerId);

    return new Response(JSON.stringify({
      success: true,
      organizationId,
      message: 'Turno API integration test completed successfully',
      data: {
        connection: connectionTest.data,
        properties: propertiesResult.success
          ? {
              count: propertiesResult.data?.data?.length || 0,
              sample: propertiesResult.data?.data?.slice(0, 2) || [],
            }
          : { error: propertiesResult.error },
        problems: problemsResult.success
          ? {
              count: problemsResult.data?.data?.length || 0,
              sample: problemsResult.data?.data?.slice(0, 2) || [],
            }
          : { error: problemsResult.error },
      },
      stats: {
        totalProperties: propertiesResult.data?.data?.length || 0,
        totalProblems: problemsResult.data?.data?.length || 0,
        connectionStatus: 'connected',
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error: any) {
    console.error('❌ Turno sync error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      message: 'Turno sync operation failed',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
