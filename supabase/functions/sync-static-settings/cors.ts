
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const handleCorsRequest = () => {
  return new Response(null, { headers: corsHeaders });
};

export const createSuccessResponse = (data: any) => {
  return new Response(
    JSON.stringify(data),
    { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};

export const createErrorResponse = (error: string, status: number = 500) => {
  return new Response(
    JSON.stringify({ 
      success: false, 
      error 
    }),
    { 
      status, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
};
