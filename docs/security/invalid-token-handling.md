# Invalid Token Handling - Security Fix

## Problem

When a user's authentication token became invalid (due to database reset, user deletion, or token tampering), the system would:

1. **Verify JWT signature** ✓
2. **Check token expiration** ✓
3. **Validate required fields** ✓
4. **BUT NOT check if user still exists in database** ✗

This allowed users with technically valid (signed, non-expired) tokens to access the system even after:
- Database reset
- User account deletion
- User data corruption

Additionally, invalid cookies remained in the browser, causing repeated verification attempts on every request.

## Solution

### 1. Middleware - JWT Verification Only
**File:** `packages/auth/src/middleware.ts`

**Important:** Next.js middleware runs in **Edge Runtime**, which doesn't support Prisma or Node.js APIs. Therefore, middleware can only:
- Verify JWT signature and expiration
- Check token format
- Clear invalid cookies

Database validation **cannot** happen in middleware due to Edge Runtime limitations.

### 2. Database Validation in API Routes
**File:** `packages/auth/src/verify-auth.ts`

Added same database check for API route authentication:
```typescript
// Verify user still exists in database
const user = await prisma.user.findUnique({
  where: { id: payload.id },
  select: { id: true }
})

if (!user) {
  return { authenticated: false, userId: null }
}
```

### 3. Clear Invalid Cookies
**Files:**
- `packages/auth/src/middleware.ts` - Added `clearCookieInResponse()` helper
- `apps/finance/src/shared/utils/api.ts` - Updated `UnauthorizedResponse()` to clear cookies

When invalid tokens are detected, the system now:
1. Clears the `auth_token` cookie (sets `maxAge: 0`)
2. Redirects to login (page routes) or returns 401 (API routes)

This prevents repeated verification attempts with known-invalid tokens.

## Security Benefits

1. **API-level protection** - API routes verify user existence before processing requests
2. **Database integrity** - API routes respect database state, not just token validity
3. **Performance** - Invalid cookies are cleared, reducing unnecessary verification attempts
4. **User experience** - Clean slate after logout/reset, no stale cookies

## Performance Impact

- **Added cost:** One database query per authenticated **API request**: `SELECT id FROM users WHERE id = ?`
- **Indexed lookup:** Primary key lookup is extremely fast (< 1ms typically)
- **Necessary trade-off:** Security requires validating user existence
- **Page routes:** Will pass middleware with valid JWT, but API calls will fail (user sees empty data)

## Testing

To verify the fix works:

1. Start the app and login normally
2. Reset the database: `pnpm db:push --force-reset`
3. Try to access any protected page or make an API call
4. **Expected behavior:**
   - **Page routes:** Will load (JWT is valid) but show empty data
   - **API routes:** Return 401 with cookie cleared ✅
   - **User experience:** Sees errors, retries, gets logged out
5. **Before fix:** API would return user data even after database reset ✗

## Edge Runtime Limitation

Next.js middleware runs in **Edge Runtime**, which has restrictions:
- No Prisma (uses Node.js APIs not available in Edge)
- No file system access
- No Node.js built-ins like `fs`, `crypto` (partial), etc.

This means **we cannot check the database in middleware**. The trade-off:
- ✅ API routes are protected (database check happens there)
- ⚠️ Page routes pass middleware but fail on data fetch (acceptable UX)
- 🔒 Security is maintained (no sensitive data exposed via APIs)

## Files Modified

- `packages/auth/src/middleware.ts` - Database check + cookie clearing in middleware
- `packages/auth/src/verify-auth.ts` - Database check for API routes
- `apps/finance/src/shared/utils/api.ts` - Clear cookies in 401 responses
- `packages/auth/src/index.ts` - Export `COOKIE_NAME` constant

## Related Standards

- See `docs/development/standards.md` - Security Standards section
- Authorization: "ALWAYS verify user owns the resource they're accessing"
- Authentication: "Verify JWT token on EVERY API request"

