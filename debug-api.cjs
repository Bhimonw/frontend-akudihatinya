// Simple debug script to check API URL construction
const fs = require('fs');
const path = require('path');

// Read .env file
const envPath = path.join(__dirname, '.env');
let envContent = '';
try {
    envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
    console.log('No .env file found');
}

// Parse environment variables
const envVars = {};
envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
        envVars[key.trim()] = value.trim();
    }
});

console.log('=== API URL Debug Information ===');
console.log('Environment Variables:');
console.log('- VITE_API_BASE_URL:', envVars.VITE_API_BASE_URL);
console.log('- NODE_ENV:', process.env.NODE_ENV);

console.log('\nURL Construction Test:');
const baseUrl = envVars.VITE_API_BASE_URL || 'http://localhost:8000/api';
console.log('- Base URL:', baseUrl);
console.log('- Login endpoint: /login');
console.log('- Full login URL:', `${baseUrl}/login`);
console.log('- Refresh URL:', `${baseUrl}/refresh`);

console.log('\nURL Analysis:');
console.log('- URL length:', baseUrl.length);
console.log('- Ends with /api:', baseUrl.endsWith('/api'));
console.log('- Contains https:', baseUrl.includes('https'));
console.log('- Domain:', baseUrl.replace(/https?:\/\//, '').split('/')[0]);

console.log('\n=== Test Request Construction ===');
const loginUrl = `${baseUrl}/login`;
console.log('Final login URL that would be called:', loginUrl);
console.log('URL breakdown:');
console.log('- Protocol:', loginUrl.split('://')[0]);
console.log('- Domain:', loginUrl.split('://')[1].split('/')[0]);
console.log('- Path:', '/' + loginUrl.split('://')[1].split('/').slice(1).join('/'));

console.log('\n=== End Debug Information ===');