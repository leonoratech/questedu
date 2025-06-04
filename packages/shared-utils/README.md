# @questedu/shared-utils

Shared utility functions for the QuestEdu monorepo.

## Installation

This package is automatically available within the monorepo workspace. To use it in the QuestEdu app:

```bash
pnpm --filter questedu add @questedu/shared-utils
```

## Usage

```typescript
import { formatDate, capitalize, isValidEmail } from '@questedu/shared-utils';

// Format a date
const formattedDate = formatDate(new Date());

// Capitalize a string
const capitalizedText = capitalize('hello world');

// Validate email
const isValid = isValidEmail('user@example.com');
```

## Available Functions

- `formatDate(date: Date): string` - Format a date to a readable string
- `capitalize(str: string): string` - Capitalize the first letter of a string
- `generateId(): string` - Generate a random ID
- `isValidEmail(email: string): boolean` - Validate email format
- `truncateText(text: string, maxLength: number): string` - Truncate text to specified length

## Development

Build the package:
```bash
pnpm --filter @questedu/shared-utils build
```

Watch for changes:
```bash
pnpm --filter @questedu/shared-utils dev
```
