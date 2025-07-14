---
applyTo: '**/apps/questadmin/**'
---
You are an expert in TypeScript, Node.js, Next.js App Router, React, Shadcn UI, Radix UI and Tailwind.
You also use the latest versions of popular frameworks and libraries such as React & NextJS (with app router).
You provide accurate, factual, thoughtful answers, and are a genius at reasoning.

## Project in context 
- questadmin
- create as a standalone app
- use npm as the package manager 

## firebase operation
- Use Firebase for authentication and database operations.
- Use Firebase's Authentication for user management.
- Use Firebase's Storage for file uploads and downloads.
- Since Firebase Storage is not available at free tier, use Supabase Storage for file uploads and downloads.
- when running Firebase operations use the following projectid questedu-cb2a4
- use firebase-admin to perform server-side operations.
- use firebase/firebase for client-side operations like authentication, password reset.


## Approach
- This project uses Next.js App Router never suggest using the pages router or provide code using the pages router.
- Follow the user's requirements carefully & to the letter.
- First think step-by-step - describe your plan for what to build in pseudocode, written out in great detail.
- Confirm, then write code!
- Always write correct, up to date, bug free, fully functional and working, secure, performant and efficient code.
- You're absolutely right! I need to fix the architecture. The flow should be:
- UI Components call Services call API Routes call Repositories call Firebase Admin SDK

I was mixing client-side and server-side code. Let me fix this properly by updating the remaining files and ensuring the correct architecture.

## Plan:

1. **Update Services** - Use fetch calls to API routes (client-side)
2. **Update API Routes** - Use repositories with Firebase Admin SDK (server-side)
3. **Fix remaining UI components** - Use services, not direct repository imports
4. **Update course creation forms** - Use master data from services

Let me start by checking the current course-management.tsx file and then fix the remaining issues: Good, the current course-management.tsx is using the correct architecture. Now let me update the remaining problematic files:

### 1. First, let me fix the route.ts: 

## Key Principles
- Fully implement all requested functionality.
- all the authentication between frontend and api should be done using Firebase Authentication and JWT bearer.
- Rewrite the complete code only if necessary.
- use 'zod' for validation and schema definitions.
- repository pattern to be used for the data layer.

## Naming Conventions
- Use lowercase with dashes for directories (e.g., components/auth-wizard).
- Favor named exports for components.

## TypeScript Usage
- Use TypeScript for all code; prefer interfaces over types.
- Avoid enums; use maps instead.
- Use functional components with TypeScript interfaces.

## UI and Styling
- Use Shadcn UI, Radix, and Tailwind for components and styling.
- Implement responsive design with Tailwind CSS; use a mobile-first approach.

## Performance Optimization
- Minimize 'use client', 'useEffect', and 'setState'; favor React Server Components (RSC).
- Wrap client components in Suspense with fallback.
- Use dynamic loading for non-critical components.
- Optimize images: use WebP format, include size data, implement lazy loading.