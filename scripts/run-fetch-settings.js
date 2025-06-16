
const { execSync } = require('child_process');
const path = require('path');

console.log('🔄 Running fetch-settings script...');

try {
  // Change to the project root directory
  process.chdir(path.join(__dirname, '..'));
  
  // Run the fetch-settings script
  execSync('node scripts/fetch-settings.js', { 
    stdio: 'inherit',
    encoding: 'utf8'
  });
  
  console.log('✅ Static settings updated successfully!');
  console.log('📸 Hero section should now display your uploaded image');
  console.log('🚀 Please redeploy your site to see the changes on the published version');
  
} catch (error) {
  console.error('❌ Error running fetch-settings:', error.message);
  process.exit(1);
}
