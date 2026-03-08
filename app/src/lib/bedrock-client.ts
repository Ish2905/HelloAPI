// ─── Amazon Bedrock Client for HelloAPI ───
// Provides AI-powered endpoint explanations and error troubleshooting
// using Claude via AWS Bedrock.

import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Endpoint, ApiSpec } from './types';

// ─── Configuration (via env vars with sensible defaults) ───
const REGION = process.env.AWS_BEDROCK_REGION || process.env.AWS_REGION || 'us-east-1';
const MODEL_ID = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0';

let client: BedrockRuntimeClient | null = null;

function getClient(): BedrockRuntimeClient {
    if (!client) {
        client = new BedrockRuntimeClient({ region: REGION });
    }
    return client;
}

// ─── Helper: Invoke Claude via Bedrock ───
async function invokeModel(prompt: string, maxTokens = 1024): Promise<string> {
    const bedrockClient = getClient();

    const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: maxTokens,
        messages: [
            {
                role: 'user',
                content: prompt,
            },
        ],
    };

    const command = new InvokeModelCommand({
        modelId: MODEL_ID,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
    });

    const response = await bedrockClient.send(command);
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));

    // Claude response format: { content: [{ type: "text", text: "..." }] }
    if (responseBody.content && responseBody.content.length > 0) {
        return responseBody.content[0].text;
    }

    throw new Error('Empty response from Bedrock model');
}

// ─── Build context string from API spec ───
function buildApiContext(spec: Partial<ApiSpec>): string {
    const parts: string[] = [];
    if (spec.title) parts.push(`API: ${spec.title}`);
    if (spec.baseUrl) parts.push(`Base URL: ${spec.baseUrl}`);
    if (spec.auth) parts.push(`Auth: ${spec.auth.type}${spec.auth.headerName ? ` (header: ${spec.auth.headerName})` : ''}`);
    if (spec.description) parts.push(`Description: ${spec.description}`);
    return parts.join('\n');
}

// ─── Build endpoint context string ───
function buildEndpointContext(endpoint: Endpoint): string {
    const parts: string[] = [
        `${endpoint.method} ${endpoint.path}`,
        `Summary: ${endpoint.summary || 'N/A'}`,
        `Description: ${endpoint.description || 'N/A'}`,
        `Requires Auth: ${endpoint.auth ? 'Yes' : 'No'}`,
    ];

    if (endpoint.parameters.length > 0) {
        parts.push('Parameters:');
        for (const p of endpoint.parameters) {
            parts.push(`  - ${p.name} (${p.in}, ${p.type}${p.required ? ', required' : ''}): ${p.description || 'N/A'}`);
        }
    }

    if (endpoint.requestBody) {
        parts.push('Request Body:');
        for (const f of endpoint.requestBody.schema) {
            parts.push(`  - ${f.name} (${f.type}${f.required ? ', required' : ''}): ${f.description || 'N/A'}`);
        }
    }

    if (endpoint.responses.length > 0) {
        parts.push('Responses:');
        for (const r of endpoint.responses) {
            parts.push(`  - ${r.statusCode}: ${r.description}`);
        }
    }

    return parts.join('\n');
}

// ─── Public API: Explain an Endpoint ───
export async function explainEndpoint(
    endpoint: Endpoint,
    spec: Partial<ApiSpec>
): Promise<string> {
    const prompt = `You are an expert API documentation assistant. Given the following API context and endpoint details, provide a clear, developer-friendly explanation.

API Context:
${buildApiContext(spec)}

Endpoint:
${buildEndpointContext(endpoint)}

Provide a concise explanation covering:
1. **What it does** — a plain-English summary of this endpoint's purpose
2. **Common use cases** — 2-3 typical scenarios when a developer would use this
3. **Important notes** — any caveats, gotchas, or best practices (auth requirements, pagination, rate limits)
4. **Quick example** — a brief description of a typical request/response flow

Keep the response focused and under 250 words. Use markdown formatting.`;

    return invokeModel(prompt);
}

// ─── Public API: Troubleshoot an Error ───
export async function troubleshootError(
    statusCode: number,
    responseBody: unknown,
    endpoint: Endpoint,
    spec: Partial<ApiSpec>
): Promise<string> {
    const prompt = `You are an expert API debugging assistant. A developer received an error while calling an API endpoint. Help them understand and fix the issue.

API Context:
${buildApiContext(spec)}

Endpoint called:
${endpoint.method} ${endpoint.path}
Auth required: ${endpoint.auth ? 'Yes' : 'No'}

Error received:
Status code: ${statusCode}
Response body:
${typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody, null, 2)}

Provide actionable troubleshooting guidance:
1. **What happened** — explain the error in plain English
2. **Most likely cause** — based on the status code and response
3. **How to fix it** — specific, actionable steps the developer should take
4. **Prevention tip** — one thing to do differently next time

Keep the response focused and under 200 words. Use markdown formatting.`;

    return invokeModel(prompt);
}
