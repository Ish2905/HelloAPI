import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Note: do NOT set output: 'standalone' here — that targets Docker/container
  // deployments. AWS Amplify Hosting uses its own serverless Lambda adapter for
  // Next.js, which requires a standard .next/ build output. Using 'standalone'
  // causes API routes to be bundled into a single server.js that Amplify cannot
  // invoke as Lambda functions → "network error" on every API call.
};

export default nextConfig;
