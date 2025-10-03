# Vercel Environment Variables

Copy these environment variables to your Vercel dashboard under **Project Settings → Environment Variables**:

## Required Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Optional Variables

```bash
NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_NAME=AgentsValley
```

## How to Get Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Setting Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable with:
   - **Name**: The variable name (e.g., `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: The actual value
   - **Environment**: Select all environments (Production, Preview, Development)
5. Click **Save**

## Important Notes

- Environment variables must start with `NEXT_PUBLIC_` to be accessible in the browser
- After adding variables, you may need to redeploy your application
- Never commit actual credentials to your repository
- Use different Supabase projects for development and production if needed
