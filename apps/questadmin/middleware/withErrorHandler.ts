import { NextRequest, NextResponse } from 'next/server';

export function withErrorHandler(
    handler: (req: NextRequest) => Promise<NextResponse>
) {
    return async (req: NextRequest): Promise<NextResponse> => {
        try {
            return await handler(req);
        } catch (error: any) {
            console.error('API Error:', error);
            const status = error?.statusCode || 500;
            const message = error?.message || 'Internal Server Error';

            return NextResponse.json({ error: message }, { status });
        }
    };
}
