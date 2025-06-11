# VS Code Debug Configuration for QuestAdmin

This document explains the VS Code debug configurations set up for server-side debugging of the QuestAdmin Next.js application from the monorepo root.

## Debug Configurations

### 1. Debug QuestAdmin Server (Shell) - **RECOMMENDED**
- **Purpose**: Uses pnpm as runtime executable (most reliable for monorepos)
- **Port**: 3001 (as configured in package.json)
- **Environment**: Development with NODE_TLS_REJECT_UNAUTHORIZED=0
- **Features**: 
  - Uses `runtimeExecutable: "pnpm"` to avoid shell script execution issues
  - Automatic browser opening when server is ready
  - Source map support
  - Skip node internals and node_modules

### 2. Debug QuestAdmin Server (Node Direct)
- **Purpose**: Direct Node.js execution of Next.js binary
- **Port**: 3001
- **Environment**: Development
- **Features**: 
  - Uses Next.js dist/bin/next directly
  - Bypasses shell script wrapper issues
  - Full debugging capabilities

### 3. Debug QuestAdmin Server (Original)
- **Purpose**: Standard Next.js binary execution
- **Note**: May have issues with shell script execution in some environments
- **Port**: 3001
- **Environment**: Development

### 4. Debug QuestAdmin API Routes
- **Purpose**: Focused debugging for API routes with breakpoint support
- **Port**: 9229 (debug port)
- **Environment**: Development with inspect-brk for immediate breakpoint stopping
- **Features**:
  - Smart stepping through code
  - Enhanced source map resolution for API routes
  - Breakpoint debugging from server start

### 3. Debug QuestAdmin Production
- **Purpose**: Debug production build
- **Prerequisites**: Runs build task first
- **Environment**: Production-like environment
- **Features**:
  - Tests production build behavior
  - Useful for debugging production-specific issues

### 4. Attach to QuestAdmin Server
- **Purpose**: Attach to already running server
- **Port**: 9229
- **Use case**: When server is already running with --inspect flag

## How to Use

### Quick Start
1. Open VS Code from the monorepo root (`/home/solmon/github/questedu`)
2. Open the Run and Debug panel (Ctrl+Shift+D)
3. Select "Debug QuestAdmin Server (Shell)" from the dropdown (RECOMMENDED)
4. Press F5 or click the green play button

### Alternative Options
If the shell configuration doesn't work:
1. Try "Debug QuestAdmin Server (Node Direct)" 
2. As a last resort, use "Debug QuestAdmin Server (Original)"

### API Route Debugging
1. Set breakpoints in your API route files (e.g., `/apps/questadmin/app/api/courses-validated/route.ts`)
2. Select "Debug QuestAdmin API Routes"
3. Start debugging - the server will pause at the first breakpoint hit

### Production Debugging
1. Select "Debug QuestAdmin Production"
2. The build task will run automatically first
3. Production server will start with debugging enabled

## Breakpoint Tips

### Setting Breakpoints
- Click in the gutter next to line numbers to set breakpoints
- Right-click for conditional breakpoints
- Use logpoints for non-intrusive debugging

### API Route Debugging
- Set breakpoints in your API handlers
- Test API endpoints with tools like Postman or curl
- Debug will pause at breakpoints when requests hit your routes

### Common Debugging Scenarios
```typescript
// Example: Debug the courses-validated API route
export async function POST(request: NextRequest) {
  try {
    // Set breakpoint here to debug incoming requests
    const authResult = await requireRole(UserRole.INSTRUCTOR)(request)
    
    if ('error' in authResult) {
      // Set breakpoint here to debug auth failures
      return NextResponse.json({ error: authResult.error }, { status: authResult.status })
    }

    // Set breakpoint here to debug request body parsing
    const body: CreateCourseRequest = await request.json();
    
    // ... rest of your code
  } catch (error) {
    // Set breakpoint here to debug errors
    const errorMessage = error instanceof Error ? error.message : String(error);
  }
}
```

## Workspace Structure Considerations

The debug configuration is designed to work from the monorepo root with these paths:
- **Working Directory**: `/home/solmon/github/questedu/apps/questadmin`
- **Source Maps**: Resolved relative to questadmin app
- **Node Modules**: Uses shared node_modules from monorepo root

## Environment Variables

The debug configurations include:
- `NODE_TLS_REJECT_UNAUTHORIZED=0`: For development SSL certificates
- `NODE_OPTIONS=--inspect`: Enables debugging

## Tasks Integration

The following tasks are available:
- **build-questadmin**: Builds the questadmin app
- **dev-questadmin**: Runs development server
- **install-questadmin**: Installs dependencies

## Troubleshooting

### Shell Script Execution Errors
**Error**: `SyntaxError: missing ) after argument list` or `basedir=$(dirname...)`
**Cause**: VS Code trying to execute shell scripts as Node.js code
**Solution**: Use "Debug QuestAdmin Server (Shell)" configuration which uses `runtimeExecutable`

### Port Already in Use
If port 3001 is busy, either:
1. Kill the existing process: `lsof -ti:3001 | xargs kill -9`
2. Change the port in both package.json and launch.json

### Source Maps Not Working
- Ensure TypeScript compilation is producing source maps
- Check that `resolveSourceMapLocations` paths are correct
- Verify `sourceMaps: true` in debug configuration

### Breakpoints Not Hitting
- Ensure you're debugging the correct configuration
- Check that the file path is within the `resolveSourceMapLocations`
- Verify the server is running with `--inspect` flag

### Can't Attach to Process
- Ensure the server is running with `--inspect` or `--inspect-brk`
- Check that port 9229 is available
- Use "Attach to QuestAdmin Server" configuration
