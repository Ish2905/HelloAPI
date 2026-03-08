import { NextRequest, NextResponse } from 'next/server';
import { explainEndpoint, troubleshootError } from '@/lib/bedrock-client';
import { Endpoint, ApiSpec } from '@/lib/types';

interface AiRequestBody {
    action: 'explain' | 'troubleshoot';
    endpoint: Endpoint;
    spec: Partial<ApiSpec>;
    error?: {
        status: number;
        body: unknown;
    };
}

export async function POST(request: NextRequest) {
    try {
        const body: AiRequestBody = await request.json();
        const { action, endpoint, spec, error } = body;

        if (!action || !endpoint) {
            return NextResponse.json(
                { error: 'Missing required fields: action, endpoint' },
                { status: 400 }
            );
        }

        let result: string;

        if (action === 'explain') {
            result = await explainEndpoint(endpoint, spec || {});
        } else if (action === 'troubleshoot') {
            if (!error || !error.status) {
                return NextResponse.json(
                    { error: 'Missing error details for troubleshoot action' },
                    { status: 400 }
                );
            }
            result = await troubleshootError(error.status, error.body, endpoint, spec || {});
        } else {
            return NextResponse.json(
                { error: `Unknown action: ${action}` },
                { status: 400 }
            );
        }

        return NextResponse.json({ result });
    } catch (err) {
        const message = err instanceof Error ? err.message : 'AI request failed';

        // Check for common AWS credential errors
        if (message.includes('Could not load credentials') ||
            message.includes('CredentialsProviderError') ||
            message.includes('Missing credentials')) {
            return NextResponse.json({
                error: 'AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables, or configure ~/.aws/credentials.',
                hint: 'credentials',
            }, { status: 503 });
        }

        // Check for access denied / model not enabled
        if (message.includes('AccessDeniedException') ||
            message.includes('is not authorized') ||
            message.includes('not enabled')) {
            return NextResponse.json({
                error: 'Access denied. Ensure the Bedrock model is enabled in your AWS account and your IAM user/role has bedrock:InvokeModel permission.',
                hint: 'access',
            }, { status: 403 });
        }

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
