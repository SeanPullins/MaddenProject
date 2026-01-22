# README: Adjusting Rate Limits for Paid Gemini API

If you've upgraded to a paid Gemini API plan, you can reduce the aggressive rate limiting.

## Current Settings (Optimized for Free Tier)
- **Cache Duration:** 30 minutes
- **Cooldown:** 60 seconds

## Recommended Settings for Paid Tier

### For Light-Medium Traffic (< 1000 users/day)
```typescript
// In AIReviewModal.tsx and AIComparisonModal.tsx
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const COOLDOWN_DURATION = 10 * 1000; // 10 seconds
```

### For Heavy Traffic (> 1000 users/day)
```typescript
// In AIReviewModal.tsx and AIComparisonModal.tsx
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
const COOLDOWN_DURATION = 5 * 1000; // 5 seconds
```

### For Development/Testing (No Limits)
```typescript
// In AIReviewModal.tsx and AIComparisonModal.tsx
const CACHE_DURATION = 1 * 60 * 1000; // 1 minute
const COOLDOWN_DURATION = 0; // No cooldown
```

## How to Update

1. Edit `components/AIReviewModal.tsx` (lines 36-37)
2. Edit `components/AIComparisonModal.tsx` (lines 47-48)
3. Update the cache notice messages (lines 244 and 191)
4. Rebuild and deploy

## Cost Monitoring

Monitor your usage at: https://console.cloud.google.com/apis/dashboard

Set up billing alerts:
1. Go to **Billing** → **Budgets & alerts**
2. Create budget (e.g., $10/month)
3. Set alert at 50%, 80%, 100%

## Recommendation

Start with 5-minute cache and 10-second cooldown, then adjust based on:
- Actual usage patterns
- Cost monitoring
- User feedback

Your current 30-min/60-sec settings are VERY conservative and safe for paid tier.
