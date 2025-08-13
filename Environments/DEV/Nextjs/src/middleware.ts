/**
 * Next.js Middleware for Domain Detection and Routing
 * 
 * This middleware detects the domain of the incoming request and routes it to the appropriate
 * WordPress site in the multisite setup. It also handles language detection and sets the
 * appropriate locale for internationalization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDomainConfig } from './lib/domain-config';

// Domains that should be processed by this middleware
const DOMAINS = process.env.NEXT_PUBLIC_DOMAINS?.split(',') || [];

// Domain mapping to WordPress site IDs
const DOMAIN_MAPPING = process.env.DOMAIN_MAPPING 
  ? JSON.parse(process.env.DOMAIN_MAPPING) 
  : {};

/**
 * Middleware function that runs before each request
 */
export function middleware(request: NextRequest) {
  // Get the hostname from the request
  const hostname = request.headers.get('host') || '';
  const domain = hostname.replace(/:\d+$/, ''); // Remove port if present
  
  // Skip middleware for API routes and static files
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Get domain configuration
  const domainConfig = getDomainConfig(domain);
  
  // If domain is not in our list, continue without modification
  if (!DOMAINS.includes(domain)) {
    console.warn(`Domain not configured: ${domain}`);
    return NextResponse.next();
  }

  // Clone the request URL to modify it
  const url = request.nextUrl.clone();
  
  // Add domain information to request headers
  const response = NextResponse.next();
  
  // Add custom headers for the application to use
  response.headers.set('x-domain', domain);
  response.headers.set('x-wordpress-site-id', String(DOMAIN_MAPPING[domain] || 1));
  
  // Set language based on domain configuration
  if (domainConfig?.locale) {
    response.headers.set('x-locale', domainConfig.locale);
  }
  
  // Log domain detection (in development only)
  if (process.env.NODE_ENV === 'development') {
    console.log(`Middleware: Detected domain ${domain}, WordPress Site ID: ${DOMAIN_MAPPING[domain] || 1}`);
  }
  
  return response;
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes (/api/*)
    // - Static files (*.*)
    // - Next.js specific files (/_next/*)
    '/((?!api|_next|.*\\..*).*)',
  ],
};