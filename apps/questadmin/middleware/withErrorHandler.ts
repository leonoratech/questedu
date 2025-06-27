// import { NextApiRequest, NextApiResponse } from 'next';

// export function withErrorHandler(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
//   return async (req: NextApiRequest, res: NextApiResponse) => {
//     try {
//       await handler(req, res);
//     } catch (error: any) {
//       const statusCode = error instanceof NoRecordFoundError ? error.statusCode : 500;
//       const message = error.message || 'Internal Server Error';

//       console.error('API Error:', error);

//       res.status(statusCode).json({ error: message });
//     }
//   };
// }
// // Usage example in an API route
// // import { withErrorHandler } from '@/middleware/withErrorHandler';
// // export default withErrorHandler(async (req, res) => {
// //   // Your API logic here
// // });


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
