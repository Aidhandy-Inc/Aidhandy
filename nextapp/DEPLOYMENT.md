# Deployment Guide

This guide covers deploying the AidHandy Next.js application to production and staging environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Vercel Deployment](#vercel-deployment)
- [GitHub Actions CI/CD](#github-actions-cicd)
- [Supabase Edge Functions](#supabase-edge-functions)
- [Troubleshooting](#troubleshooting)

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Code should be in a GitHub repository
3. **Supabase Project**: Set up your Supabase project
4. **API Keys**: Gather all required API keys (see Environment Variables section)

## Environment Variables

### Required Environment Variables

#### Next.js Public Variables (Exposed to Browser)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
```

#### Server-Side Only Variables (Secrets)

```bash
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_API_URL=https://api.paypal.com
STRIPE_SECRET_KEY=sk_live_your-stripe-secret-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
POSTMARK_SERVER_TOKEN=your-postmark-server-token
POSTMARK_FROM_EMAIL=support@aidhandy.com
```

### Supabase Edge Functions Secrets

These are configured in the Supabase Dashboard, not in Vercel:

1. Go to Supabase Dashboard > Your Project > Settings > Edge Functions
2. Add the following secrets:

```bash
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DUFFEL_SANDBOX_TOKEN=your-duffel-sandbox-token
# For production: DUFFEL_LIVE_TOKEN=your-duffel-live-token
AMADEUS_CLIENT_ID=your-amadeus-client-id
AMADEUS_CLIENT_SECRET=your-amadeus-client-secret
```

## Vercel Deployment

### Initial Setup

1. **Connect Repository to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure Environment Variables**:
   - In Vercel Dashboard > Project > Settings > Environment Variables
   - Add all required environment variables (see above)
   - Set different values for Production, Preview, and Development

3. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm ci`
   - Node.js Version: `18.x`

### Automatic Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and pull requests

### Manual Deployment

You can also deploy manually using the Vercel CLI:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## GitHub Actions CI/CD

The repository includes GitHub Actions workflows for automated deployments.

### Required GitHub Secrets

Configure these in GitHub > Repository > Settings > Secrets and variables > Actions:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-vercel-org-id
VERCEL_PROJECT_ID=your-vercel-project-id
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_URL=https://your-domain.com
NEXT_PUBLIC_URL_STAGING=https://staging.your-domain.com
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_API_URL=https://api.paypal.com
STRIPE_SECRET_KEY=sk_live_your-stripe-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
TWILIO_PHONE_NUMBER=+1234567890
POSTMARK_SERVER_TOKEN=your-postmark-token
POSTMARK_FROM_EMAIL=support@aidhandy.com
```

### Getting Vercel Credentials

1. **VERCEL_TOKEN**:
   - Go to Vercel Dashboard > Settings > Tokens
   - Create a new token with full access

2. **VERCEL_ORG_ID**:
   - Run `vercel link` in your project directory
   - Or check Vercel Dashboard > Team Settings > General

3. **VERCEL_PROJECT_ID**:
   - Run `vercel link` in your project directory
   - Or check `.vercel/project.json` after linking

### Workflow Triggers

- **Production**: Pushes to `main` branch
- **Staging**: Pushes to `staging` branch
- **Manual**: Use `workflow_dispatch` in GitHub Actions tab

## Supabase Edge Functions

Supabase Edge Functions are deployed separately from the Next.js app.

### Deploying Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Deploy all functions
supabase functions deploy

# Deploy a specific function
supabase functions deploy function-name
```

### Setting Edge Function Secrets

```bash
# Set a secret
supabase secrets set SECRET_NAME=secret-value

# List all secrets
supabase secrets list
```

## Deployment Checklist

### Before First Deployment

- [ ] All environment variables configured in Vercel
- [ ] Supabase Edge Functions secrets configured
- [ ] GitHub Actions secrets configured
- [ ] Vercel project linked to GitHub repository
- [ ] Domain configured (if using custom domain)
- [ ] SSL certificate verified (automatic with Vercel)

### Before Production Deployment

- [ ] All API keys are production keys (not sandbox/test)
- [ ] `NEXT_PUBLIC_ENV` set to `production`
- [ ] `NEXT_PUBLIC_URL` points to production domain
- [ ] Sentry configured for production
- [ ] Error tracking verified
- [ ] Database migrations applied
- [ ] Supabase Edge Functions deployed to production

### Post-Deployment

- [ ] Verify application loads correctly
- [ ] Test authentication flow
- [ ] Test payment integration (if applicable)
- [ ] Monitor error logs in Sentry
- [ ] Check Vercel deployment logs for warnings

## Troubleshooting

### Build Failures

**Issue**: Build fails with memory errors
- **Solution**: The build command already includes `NODE_OPTIONS='--max-old-space-size=4096'`

**Issue**: Build fails due to missing environment variables
- **Solution**: Ensure all required variables are set in Vercel Dashboard

### Deployment Failures

**Issue**: GitHub Actions deployment fails
- **Solution**: 
  - Verify all GitHub secrets are set correctly
  - Check Vercel token has proper permissions
  - Verify VERCEL_ORG_ID and VERCEL_PROJECT_ID are correct

**Issue**: Vercel deployment succeeds but app doesn't work
- **Solution**:
  - Check environment variables are set for the correct environment (Production/Preview)
  - Verify Supabase Edge Functions are accessible
  - Check browser console for errors

### Environment Variable Issues

**Issue**: Variables not available at runtime
- **Solution**: 
  - Public variables must start with `NEXT_PUBLIC_`
  - Server variables are only available in API routes and server components
  - Restart deployment after adding new variables

## Support

For issues or questions:
1. Check Vercel deployment logs
2. Check GitHub Actions workflow logs
3. Review Supabase Edge Functions logs
4. Check Sentry for error reports

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [GitHub Actions](https://docs.github.com/en/actions)

