# AgentsValley - Vercel Deployment Guide

## 🚀 Deployment Checklist

### 1. Prerequisites
- [ ] GitHub repository created
- [ ] Vercel account connected to GitHub
- [ ] Supabase project configured
- [ ] Environment variables ready

### 2. Environment Variables

Set these in your Vercel dashboard under Project Settings → Environment Variables:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# App Configuration (optional)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NEXT_PUBLIC_APP_NAME=AgentsValley
```

### 3. Vercel Configuration

The project includes a `vercel.json` file with optimal settings:
- Next.js framework detection
- Security headers
- Redirects
- Function runtime configuration

### 4. Build Settings

Vercel will automatically detect:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 5. Database Setup

Ensure your Supabase database has all required tables:
- Run the SQL from `supabase-schema.sql` in your Supabase SQL editor

### 6. Domain Configuration

After deployment:
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings → Domains
4. Add your custom domain (optional)

### 7. Performance Optimization

The app is already optimized with:
- ✅ Static generation for most pages
- ✅ Image optimization
- ✅ Code splitting
- ✅ Caching strategies
- ✅ Error boundaries

### 8. Monitoring

Set up monitoring in Vercel:
- Function logs
- Analytics
- Performance monitoring

## 🔧 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version (should be 18+)
   - Verify all dependencies are in package.json
   - Check for TypeScript errors

2. **Function Runtime Errors**
   - If you see "Function Runtimes must have a valid version" error
   - Remove the `functions` section from vercel.json
   - Let Vercel auto-detect the Next.js framework

3. **Environment Variables**
   - Ensure all required variables are set
   - Check variable names match exactly
   - Verify Supabase URL and keys

4. **Database Connection**
   - Verify Supabase project is active
   - Check RLS policies
   - Ensure tables exist

5. **Performance Issues**
   - Check bundle size
   - Optimize images
   - Review caching strategies

## 📊 Post-Deployment

After successful deployment:

1. **Test Core Features**
   - [ ] User authentication
   - [ ] Agent publishing
   - [ ] Event creation
   - [ ] Search functionality

2. **Performance Check**
   - [ ] Page load times
   - [ ] Core Web Vitals
   - [ ] Mobile responsiveness

3. **SEO Setup**
   - [ ] Update meta tags
   - [ ] Set up sitemap
   - [ ] Configure analytics

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [AgentsValley Repository](https://github.com/your-username/agents-valley)
