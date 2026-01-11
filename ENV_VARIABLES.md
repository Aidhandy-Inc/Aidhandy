# Environment Variables Reference

This document lists all environment variables used in the AidHandy application.

## Quick Reference

### Next.js Public Variables (Browser-Exposed)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anonymous key | `eyJhbGc...` |
| `NEXT_PUBLIC_URL` | ✅ Yes | Application base URL | `https://aidhandy.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | ⚠️ Optional | Sentry DSN for error tracking | `https://xxx@sentry.io/xxx` |
| `NEXT_PUBLIC_ENV` | ✅ Yes | Environment name | `production`, `staging`, `development` |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | ✅ Yes | PayPal client ID | `AeA1QIZX...` |

### Server-Side Variables (Secrets)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `PAYPAL_CLIENT_SECRET` | ✅ Yes | PayPal client secret | `EPMcm...` |
| `PAYPAL_API_URL` | ✅ Yes | PayPal API endpoint | `https://api.paypal.com` |
| `STRIPE_SECRET_KEY` | ✅ Yes | Stripe secret key | `sk_live_...` |
| `TWILIO_ACCOUNT_SID` | ✅ Yes | Twilio account SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | ✅ Yes | Twilio auth token | `...` |
| `TWILIO_PHONE_NUMBER` | ✅ Yes | Twilio phone number | `+1234567890` |
| `POSTMARK_SERVER_TOKEN` | ✅ Yes | Postmark server token | `...` |
| `POSTMARK_FROM_EMAIL` | ✅ Yes | Postmark sender email | `support@aidhandy.com` |

### Supabase Edge Functions Secrets

These are set in Supabase Dashboard, not in Next.js environment:

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes | Supabase service role key | `eyJhbGc...` |
| `DUFFEL_SANDBOX_TOKEN` | ✅ Yes (Dev) | Duffel sandbox API token | `duffel_test_...` |
| `DUFFEL_LIVE_TOKEN` | ✅ Yes (Prod) | Duffel live API token | `duffel_live_...` |
| `AMADEUS_CLIENT_ID` | ✅ Yes | Amadeus API client ID | `...` |
| `AMADEUS_CLIENT_SECRET` | ✅ Yes | Amadeus API client secret | `...` |

## Environment-Specific Values

### Development

```bash
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_URL=http://localhost:3000
PAYPAL_API_URL=https://api.sandbox.paypal.com
STRIPE_SECRET_KEY=sk_test_...
DUFFEL_SANDBOX_TOKEN=duffel_test_...
```

### Staging

```bash
NEXT_PUBLIC_ENV=staging
NEXT_PUBLIC_URL=https://staging.aidhandy.com
PAYPAL_API_URL=https://api.sandbox.paypal.com
STRIPE_SECRET_KEY=sk_test_...
DUFFEL_SANDBOX_TOKEN=duffel_test_...
```

### Production

```bash
NEXT_PUBLIC_ENV=production
NEXT_PUBLIC_URL=https://aidhandy.com
PAYPAL_API_URL=https://api.paypal.com
STRIPE_SECRET_KEY=sk_live_...
DUFFEL_LIVE_TOKEN=duffel_live_...
```

## Where to Set Variables

### Vercel

1. Go to Vercel Dashboard > Your Project > Settings > Environment Variables
2. Add variables for each environment (Production, Preview, Development)
3. Variables are automatically injected during build and runtime

### GitHub Actions

1. Go to GitHub Repository > Settings > Secrets and variables > Actions
2. Add secrets under "Repository secrets"
3. Access in workflows using `${{ secrets.VARIABLE_NAME }}`

### Supabase Edge Functions

1. Go to Supabase Dashboard > Your Project > Settings > Edge Functions
2. Click "Secrets" tab
3. Add secrets that will be available to all edge functions

### Local Development

1. Create `.env.local` file in project root
2. Add all required variables
3. Never commit `.env.local` to version control

## Security Notes

⚠️ **Important Security Guidelines:**

1. **Never commit** `.env` files to version control
2. **Never expose** server-side secrets in client-side code
3. **Use different keys** for development, staging, and production
4. **Rotate secrets** regularly, especially if exposed
5. **Use environment-specific** API endpoints (sandbox vs. production)
6. **Limit access** to production secrets to essential personnel only

## Variable Naming Convention

- **Public variables**: Must start with `NEXT_PUBLIC_` to be exposed to the browser
- **Server variables**: No prefix, only available on the server
- **Supabase secrets**: Set in Supabase Dashboard, accessed via `Deno.env.get()`

## Testing Variables

To verify variables are set correctly:

```bash
# Check if variable is set (local)
echo $NEXT_PUBLIC_SUPABASE_URL

# In Next.js code
console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)

# In Supabase Edge Functions
console.log(Deno.env.get('DUFFEL_SANDBOX_TOKEN'))
```

## Common Issues

### Variable Not Available

- **Public variables**: Ensure they start with `NEXT_PUBLIC_`
- **Server variables**: Only available in API routes and server components
- **Build-time**: Variables must be set before `npm run build`
- **Runtime**: Restart dev server after adding new variables

### Wrong Environment

- Check `NEXT_PUBLIC_ENV` matches your deployment environment
- Verify you're using the correct API endpoints (sandbox vs. production)
- Ensure Vercel environment variables are set for the correct environment

