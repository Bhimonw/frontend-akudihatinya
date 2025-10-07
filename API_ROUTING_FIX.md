# 🔧 API Routing Issue Fix

## 🚨 Problem Identified

**Error Message:**
```
The POST method is not supported for route ap/login. Supported methods: GET, HEAD.
```

**Root Cause:** The URL is being truncated from `api/login` to `ap/login`, indicating a server-side routing or URL rewriting issue.

## 🔍 Analysis

### Current Configuration:
- ✅ Frontend API URL: `https://akudihatinya.banjarkab.go.id/api`
- ❌ Server receiving: `ap/login` (missing 'i')
- ❌ Route only supports GET/HEAD, not POST

### Possible Causes:
1. **Server URL Rewriting Rules** - Apache/Nginx configuration truncating URLs
2. **Laravel Route Configuration** - Missing or incorrect API routes
3. **SSL/HTTPS Redirect Issues** - URL manipulation during redirects
4. **Proxy Configuration** - Load balancer or proxy modifying requests

## 🛠️ Solutions

### 1. Backend Route Verification

Check Laravel routes file (`routes/api.php`):
```php
<?php
// routes/api.php

Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/users/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});
```

### 2. Server Configuration Fix

#### Apache (.htaccess)
```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]

# Ensure API routes are preserved
RewriteRule ^api/(.*)$ api/$1 [L]
```

#### Nginx
```nginx
location /api {
    try_files $uri $uri/ /index.php?$query_string;
}

location ~ \.php$ {
    fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    fastcgi_index index.php;
    fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
    include fastcgi_params;
}
```

### 3. Laravel Configuration

#### Update `config/app.php`:
```php
'url' => env('APP_URL', 'https://akudihatinya.banjarkab.go.id'),
```

#### Update `.env`:
```env
APP_URL=https://akudihatinya.banjarkab.go.id
APP_ENV=production
APP_DEBUG=false
```

### 4. CORS Configuration

#### Update `config/cors.php`:
```php
'allowed_origins' => [
    'https://akudihatinya.banjarkab.go.id',
    'http://localhost:5174', // for development
],

'allowed_methods' => ['*'],

'allowed_headers' => ['*'],
```

## 🧪 Testing Steps

### 1. Test API Endpoint Directly
```bash
# Test if the endpoint exists
curl -X POST https://akudihatinya.banjarkab.go.id/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

### 2. Check Route List
```bash
# On the server
php artisan route:list | grep login
```

### 3. Debug URL Construction
Add this to your browser console:
```javascript
// Check environment variable
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);

// Test actual request
fetch('https://akudihatinya.banjarkab.go.id/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'test', password: 'test' })
})
.then(response => console.log('Response:', response))
.catch(error => console.log('Error:', error));
```

## 🔧 Immediate Fixes

### Option 1: Use Full URL Path
Update the API base URL to include the full path:
```env
# In .env
VITE_API_BASE_URL=https://akudihatinya.banjarkab.go.id/api
```

### Option 2: Alternative Endpoint
If the main domain has issues, try:
```env
# Alternative subdomain
VITE_API_BASE_URL=https://api.akudihatinya.banjarkab.go.id/api
```

### Option 3: Temporary Workaround
Use direct IP if domain has routing issues:
```env
# Use server IP temporarily
VITE_API_BASE_URL=https://[SERVER_IP]/api
```

## 📋 Checklist for Server Admin

- [ ] Verify Laravel routes are properly defined
- [ ] Check Apache/Nginx configuration for URL rewriting
- [ ] Ensure SSL certificate is properly configured
- [ ] Verify CORS settings allow frontend domain
- [ ] Check if there are any proxy/load balancer configurations
- [ ] Test API endpoints directly on the server
- [ ] Review server error logs for additional clues

## 🚀 Next Steps

1. **Contact Server Administrator** to check the backend configuration
2. **Test Alternative URLs** to isolate the issue
3. **Review Server Logs** for more detailed error information
4. **Implement Fallback Strategy** if needed

## 📞 Emergency Fallback

If the issue persists, temporarily use localhost for development:
```env
# Temporary development fallback
VITE_API_BASE_URL=http://localhost:8000/api
```

Then deploy the backend to a working server or fix the current server configuration.