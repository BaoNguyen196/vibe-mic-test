# Deployment Guide

**Project:** Vibe Mic Test SPA
**Version:** 0.0.0
**Last Updated:** 2026-02-09

## Quick Start

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- Git for version control
- HTTPS capable hosting (required for getUserMedia)

### Local Development

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev

# 3. Open in browser
# http://localhost:5173

# 4. Code changes auto-refresh with HMR
# Edit src/ files and see changes instantly
```

### Production Build

```bash
# 1. Build optimized production bundle
npm run build

# 2. TypeScript compilation + minification
# Output: dist/ folder
# Size: ~60.81 KB gzipped

# 3. Preview production build locally
npm run preview

# 4. Deploy dist/ folder to web server
```

## Build Process

### Build Steps

1. **TypeScript Compilation** (`tsc -b`)
   - Type checking
   - Error detection
   - Build cache optimization

2. **ESLint Validation** (run separately)
   ```bash
   npm run lint
   ```

3. **Vite Production Build**
   - React JSX transformation
   - Tailwind CSS processing
   - Module bundling
   - Code minification
   - Asset optimization

### Build Output Structure

```
dist/
├── index.html                  # Entry HTML
├── assets/
│   ├── index-*.js             # Main bundle
│   ├── index-*.css            # Styles
│   └── vite-*.svg             # Vite logo
└── vite.svg                   # Static asset
```

### Build Configuration

**vite.config.ts**
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

No custom build optimizations needed - Vite provides excellent defaults.

## Pre-Deployment Checklist

Before deploying to production:

```bash
# 1. Ensure all tests pass
npm run test  # Phase 02+ when testing framework added

# 2. Run linter and fix issues
npm run lint

# 3. Run TypeScript compiler
npm run build

# 4. Verify bundle size
# Should be < 100 KB gzipped

# 5. Test locally with production build
npm run preview

# 6. Test on multiple browsers
# Chrome, Firefox, Safari, Edge (latest versions)

# 7. Test on mobile devices
# iOS Safari, Android Chrome

# 8. Verify microphone permissions work
# Test permission request flow

# 9. Check Core Web Vitals
# Use Lighthouse in DevTools
```

## Hosting Options

### GitHub Pages (Recommended for MVP)

#### Setup

```bash
# 1. Add deployment script to package.json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}

# 2. Install gh-pages package
npm install --save-dev gh-pages

# 3. Add to package.json
{
  "homepage": "https://yourusername.github.io/vibe-mic-test"
}

# 4. Configure github-pages branch
# Go to GitHub repo Settings > Pages > Source > gh-pages branch

# 5. Deploy
npm run deploy
```

#### Limitations
- Static hosting only
- No server-side processing
- Limited to 1 GB storage
- GitHub rate limits

### Vercel (Recommended for Production)

#### Setup

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Link to Vercel project
vercel

# 3. Deploy to production
vercel --prod

# Or use Git push (if connected)
git push
```

#### Vercel Configuration

Create `vercel.json`:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "envPrefix": "VITE_"
}
```

#### Benefits
- HTTPS included
- Global CDN
- Automatic deployments on git push
- Environment variables support
- Analytics & monitoring

### Netlify (Alternative)

#### Setup

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Link to Netlify project
netlify init

# 3. Deploy
netlify deploy --prod
```

#### netlify.toml Configuration

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"
```

#### Benefits
- Easy Git integration
- One-click deployments
- Excellent analytics
- Form handling (Phase 02+)

### Traditional Web Server (Apache, Nginx)

#### Deploy Steps

1. **Build locally**
   ```bash
   npm run build
   ```

2. **Upload dist/ folder**
   ```bash
   scp -r dist/* user@server.com:/var/www/app/
   ```

3. **Configure web server**

   **Nginx Configuration:**
   ```nginx
   server {
     listen 443 ssl http2;
     server_name yourdomain.com;

     ssl_certificate /path/to/cert.pem;
     ssl_certificate_key /path/to/key.pem;

     root /var/www/app;

     # SPA routing
     location / {
       try_files $uri /index.html;
     }

     # Static assets with cache
     location ~* \.(js|css|svg|png|jpg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
     }

     # Security headers
     add_header Strict-Transport-Security "max-age=31536000" always;
     add_header X-Frame-Options "DENY" always;
     add_header X-Content-Type-Options "nosniff" always;
   }
   ```

   **Apache Configuration (.htaccess):**
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule ^ index.html [QSA,L]
   </IfModule>

   # Cache headers
   <FilesMatch "\.(js|css|svg)$">
     Header set Cache-Control "public, max-age=31536000, immutable"
   </FilesMatch>

   # Security headers
   Header set Strict-Transport-Security "max-age=31536000"
   Header set X-Frame-Options "DENY"
   Header set X-Content-Type-Options "nosniff"
   ```

## HTTPS Requirements

### Why HTTPS is Required

- `getUserMedia` API requires secure context
- Browsers block microphone access on HTTP (except localhost)
- Privacy and security standard

### Getting HTTPS Certificates

**Let's Encrypt (Free)**
```bash
# Using Certbot
certbot certonly --webroot -w /var/www/app -d yourdomain.com

# Auto-renewal
certbot renew --dry-run
```

**Self-Signed (Development Only)**
```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365
```

## Environment Configuration

### Environment Variables

File: `.env` (not in version control)
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=Vibe Mic Test
VITE_DEBUG=false
```

### Access in Code

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
const appName = import.meta.env.VITE_APP_NAME;
const debug = import.meta.env.VITE_DEBUG === 'true';
```

### Build-Time Environment Variables

```bash
# Build with environment variable
VITE_DEBUG=true npm run build

# Different builds for different environments
VITE_ENV=production npm run build
VITE_ENV=staging npm run build
```

## Performance Optimization

### Already Configured

- Code splitting (Vite automatic)
- Minification (Vite automatic)
- CSS purging (Tailwind automatic)
- Asset optimization (Vite automatic)
- gzip compression (server configuration)

### Web Server Configuration

#### Enable gzip Compression (Nginx)

```nginx
gzip on;
gzip_vary on;
gzip_min_length 1000;
gzip_types text/plain text/css text/xml text/javascript
           application/javascript application/xml+rss
           application/json application/x-font-ttf;
```

#### Enable gzip Compression (Apache)

```apache
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/plain text/css text/html text/javascript
  AddOutputFilterByType DEFLATE application/javascript application/json
</IfModule>
```

#### Browser Caching Headers

```
dist/index.html          -> max-age=0 (no cache, always check)
dist/assets/*.js         -> max-age=31536000 (1 year - immutable)
dist/assets/*.css        -> max-age=31536000 (1 year - immutable)
```

### Core Web Vitals Optimization

**Largest Contentful Paint (LCP)**
- Current: < 1s (excellent)
- Ensure fonts load fast
- Optimize images Phase 02+

**First Input Delay (FID) / Interaction to Next Paint (INP)**
- Current: < 100ms (excellent)
- Keep JS bundles small
- Avoid long-running scripts

**Cumulative Layout Shift (CLS)**
- Current: < 0.1 (excellent)
- Fixed dimensions for media Phase 04+
- No layout surprises

## Monitoring & Analytics

### Health Checks

```bash
# Monitor production deployment
curl -I https://yourdomain.com/

# Should return 200 OK
# Check response headers for security settings
```

### Error Tracking (Phase 02+)

Recommended services:
- Sentry (error tracking)
- LogRocket (session replay)
- Datadog (APM)

### Analytics (Phase 02+)

Recommended services:
- Google Analytics 4
- Plausible Analytics
- Fathom Analytics

## Rollback Procedure

### Manual Rollback

```bash
# If deployment fails, restore previous dist/
git checkout HEAD~1 -- dist/
git commit -m "Rollback to previous version"
git push
```

### Vercel Rollback

```bash
# Via Vercel Dashboard
1. Go to Deployments tab
2. Click on previous successful deployment
3. Click "Promote to Production"
```

### GitHub Pages Rollback

```bash
# Redeploy previous version
git checkout HEAD~1
npm run build
npm run deploy
```

## Post-Deployment Testing

### Smoke Tests

```bash
1. Load homepage
2. Check for console errors
3. Test microphone permission request
4. Verify dark mode toggle works
5. Test on mobile (iOS + Android)
6. Check all links work
7. Verify no 404 errors
```

### Performance Testing

```bash
1. Run Lighthouse audit
2. Check Core Web Vitals
3. Test on slow 4G network
4. Monitor CPU/memory usage
5. Test with microphone active
```

### Accessibility Testing

```bash
1. Test keyboard navigation
2. Verify screen reader compatibility
3. Check color contrast ratios
4. Test at different zoom levels
5. Verify focus indicators
```

## Troubleshooting

### Build Fails

```bash
# Clear build cache
rm -rf dist/ node_modules/.vite

# Reinstall dependencies
rm package-lock.json
npm install

# Rebuild
npm run build
```

### Bundle Too Large

```bash
# Analyze bundle
npm install -g vite-plugin-visualizer

# Find large dependencies
npm list

# Remove unused dependencies
npm prune
```

### Microphone Not Working

```bash
# Check browser console for errors
# Verify HTTPS is enabled
# Check browser microphone permissions
# Test on http://localhost:5173 (dev mode)
```

### Type Errors After Deployment

```bash
# Rebuild with TypeScript checking
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Fix all errors before deploying
npm run lint
```

## Security Checklist

- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] No console errors
- [ ] No unhandled promise rejections
- [ ] Microphone permission properly requested
- [ ] No sensitive data in localStorage
- [ ] CORS properly configured (if API Phase 02+)
- [ ] Environment variables secured
- [ ] Dependencies up-to-date
- [ ] No known vulnerabilities (npm audit)

## Maintenance

### Regular Updates

```bash
# Check for outdated dependencies
npm outdated

# Update dependencies safely
npm update

# For major version updates (manual review required)
npm install package@latest
```

### Monitoring Deployments

```bash
# Check deployment status
npm run build

# Test locally before deploying
npm run preview

# Deploy to production
# (Use your hosting platform's deployment method)
```

## Deployment Checklist Summary

- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] `npm run preview` works locally
- [ ] Tested on Chrome, Firefox, Safari, Edge
- [ ] Tested on iOS Safari and Android Chrome
- [ ] Core Web Vitals green (Lighthouse 95+)
- [ ] Security headers configured
- [ ] HTTPS certificate valid
- [ ] DNS configured correctly
- [ ] Post-deployment smoke tests pass
- [ ] Monitoring/analytics configured
- [ ] Rollback plan documented
- [ ] Team notified of deployment

## Support & Troubleshooting

For deployment issues, consult:
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [GitHub Pages Documentation](https://pages.github.com/)
