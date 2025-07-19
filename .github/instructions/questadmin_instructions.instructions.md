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
- when running Firebase operations use the following projectid leonora-c9f8b
- use firebase-admin to perform server-side operations.
- use firebase/firebase for client-side operations like authentication, password reset.

## Key Design Principles
- All the firebase operations should be done using the Firebase Admin SDK on the server-side and Firebase SDK on the client-side.
- Frontend ui calls the backend api's which will use repository pattern to talk to firebase store.
- use 'zod' for validation and schema definitions on client side.
- use 'joi' for validation and schema definitions on server side.
- repository pattern to be used for the data layer.
- UI Components will talk to the restful api's created on the nextjs app router.
- UI Components will be going via clientside service layer to call the backend api's.
- UI Component should only have model references to the 'dtos' folder models where responses for model, create, update etc.. should be found and added.
- Backend apis should be in the 'app/api' folder.
- Backend data access should be in the 'data/*' folder for models and repositories.

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