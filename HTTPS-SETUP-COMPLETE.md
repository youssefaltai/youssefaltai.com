# HTTPS Multi-App Setup Complete

## Summary

All three apps are now configured to run on HTTPS with proper SSL certificates:

- **Dashboard**: https://youssefaltai.local:3000
- **Finance**: https://youssefaltai.local:3001
- **Fitness**: https://youssefaltai.local:3002

## What Was Done

### 1. mkcert Cleanup & Fresh Install
- Removed all existing .pem files from the project
- Uninstalled and reinstalled mkcert
- Generated fresh certificates for `youssefaltai.local` and all subdomains

### 2. Certificates
- Generated: `youssefaltai.local+4.pem` and `youssefaltai.local+4-key.pem`
- Copied to all three apps: `apps/{dashboard,finance,fitness}/certs/`
- Valid until: **January 12, 2028**

### 3. Package Scripts Updated
All three apps now have their `dev:https` scripts configured with:
- Explicit port assignments (3000, 3001, 3002)
- Correct certificate paths
- Turbopack enabled

### 4. Configuration
- `/etc/hosts` already has: `127.0.0.1 youssefaltai.local` ✅
- `.gitignore` already excludes certificates (`.pem` and `certs/`) ✅

## Important: One Manual Step Required

The certificates are generated, but you need to trust them in your system:

```bash
sudo mkcert -install
```

This adds the mkcert root CA to your system's trust store so browsers will accept the certificates.

## Usage

Run all apps together:

```bash
pnpm dev:https
```

Or run specific apps:

```bash
pnpm dev:https --filter dashboard
pnpm dev:https --filter finance
pnpm dev:https --filter fitness
```

## Access URLs

- Dashboard: https://youssefaltai.local:3000
- Finance: https://youssefaltai.local:3001
- Fitness: https://youssefaltai.local:3002

## Troubleshooting

If you see certificate warnings in your browser:

1. Make sure you ran: `sudo mkcert -install`
2. Restart your browser after installing the root CA
3. Check that certificates exist in each app's `certs/` directory
4. Verify `/etc/hosts` has the `youssefaltai.local` entry

## Notes

- Certificates are shared across all apps (wildcard certificate)
- Certificates are git-ignored and won't be committed
- Each app runs on its own port to avoid conflicts
- Turbo runs all dev:https tasks in parallel automatically

