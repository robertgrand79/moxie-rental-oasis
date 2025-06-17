
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = 'https://joiovubyokikqjytxtuv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaW92dWJ5b2tpa3FqeXR4dHV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTI0NzY5NCwiZXhwIjoyMDY0ODIzNjk0fQ.H6VWJHOoYwgMhXPoCaOhTaHwQ-LnLb9vKHjgAKjO5rE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateHeroImageSetting() {
  try {
    console.log('🔄 Updating hero background image setting...');
    
    const newHeroImageUrl = 'https://joiovubyokikqjytxtuv.supabase.co/storage/v1/object/public/hero-images/hero-1750167903500.jpg';
    
    // Check if setting exists
    const { data: existingData, error: selectError } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', 'heroBackgroundImage')
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    let result;
    if (existingData) {
      // Update existing setting
      result = await supabase
        .from('site_settings')
        .update({
          value: newHeroImageUrl,
          updated_at: new Date().toISOString()
        })
        .eq('key', 'heroBackgroundImage')
        .select();
    } else {
      // Insert new setting
      result = await supabase
        .from('site_settings')
        .insert({
          key: 'heroBackgroundImage',
          value: newHeroImageUrl,
          created_by: '00000000-0000-0000-0000-000000000000' // System user
        })
        .select();
    }

    const { error } = result;

    if (error) {
      console.error('❌ Error updating hero image setting:', error);
      throw error;
    }

    console.log('✅ Hero background image setting updated successfully!');
    console.log('🖼️ New hero image URL:', newHeroImageUrl);
    console.log('🚀 Changes will be visible immediately on refresh');
    
  } catch (error) {
    console.error('❌ Error updating hero image setting:', error);
    process.exit(1);
  }
}

// Run the update
updateHeroImageSetting();
