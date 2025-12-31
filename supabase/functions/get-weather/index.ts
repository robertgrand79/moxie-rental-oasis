import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WeatherResponse {
  configured: boolean;
  current?: {
    temp: number;
    feels_like: number;
    humidity: number;
    wind_speed: number;
    description: string;
    icon: string;
  };
  forecast?: Array<{
    date: string;
    high: number;
    low: number;
    description: string;
    icon: string;
  }>;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId } = await req.json();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ configured: false, error: 'Property ID required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch property to get coordinates and organization
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('latitude, longitude, organization_id')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('Property fetch error:', propertyError);
      return new Response(
        JSON.stringify({ configured: false, error: 'Property not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { latitude, longitude, organization_id } = property;

    if (!latitude || !longitude) {
      return new Response(
        JSON.stringify({ configured: false, error: 'Property coordinates not set' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch organization for OpenWeather API key
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('openweather_api_key')
      .eq('id', organization_id)
      .single();

    if (orgError || !org?.openweather_api_key) {
      console.log('No OpenWeather API key configured for organization');
      return new Response(
        JSON.stringify({ configured: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = org.openweather_api_key;

    // Fetch current weather
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    const currentResponse = await fetch(currentUrl);
    
    if (!currentResponse.ok) {
      console.error('Weather API error:', await currentResponse.text());
      return new Response(
        JSON.stringify({ configured: false, error: 'Weather API error' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const currentData = await currentResponse.json();

    // Fetch 5-day forecast
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=imperial`;
    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();

    // Process forecast - get one entry per day (noon)
    const dailyForecasts: WeatherResponse['forecast'] = [];
    const seenDates = new Set<string>();

    if (forecastData.list) {
      for (const item of forecastData.list) {
        const date = item.dt_txt.split(' ')[0];
        if (!seenDates.has(date) && item.dt_txt.includes('12:00:00')) {
          seenDates.add(date);
          dailyForecasts.push({
            date,
            high: Math.round(item.main.temp_max),
            low: Math.round(item.main.temp_min),
            description: item.weather[0]?.description || '',
            icon: item.weather[0]?.icon || '01d',
          });
        }
        if (dailyForecasts.length >= 5) break;
      }
    }

    const response: WeatherResponse = {
      configured: true,
      current: {
        temp: currentData.main.temp,
        feels_like: currentData.main.feels_like,
        humidity: currentData.main.humidity,
        wind_speed: currentData.wind.speed,
        description: currentData.weather[0]?.description || '',
        icon: currentData.weather[0]?.icon || '01d',
      },
      forecast: dailyForecasts,
    };

    return new Response(
      JSON.stringify(response),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=1800' // Cache for 30 min
        } 
      }
    );

  } catch (error) {
    console.error('Weather function error:', error);
    return new Response(
      JSON.stringify({ configured: false, error: 'Internal error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
