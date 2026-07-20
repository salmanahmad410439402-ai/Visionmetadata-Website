# Server Setup Fix

The server had ES module compatibility issues with `ts-node-dev`. This has been fixed by:

1. Switching to `tsx` for development (better ES module support)
2. Adding proper `__dirname` definition for ES modules
3. Converting `require("https")` to import statement

## Steps to get it running:

```bash
cd server

# Clean install
rm -rf node_modules package-lock.json

# Install with new dependencies
npm install

# Start dev server
npm run dev
```

The server should now start on `http://localhost:4000` without errors.

**Expected output:**
```
VisionMeta server listening on http://localhost:4000
```

If you're still seeing issues, delete `server/node_modules` entirely and run `npm install` again.
