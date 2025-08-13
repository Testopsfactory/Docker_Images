/**
 * Tests for the domain detection middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../src/middleware';
import { getDomainConfig } from '../src/lib/domain-config';

// Mock the next/server module
jest.mock('next/server', () => ({
  NextResponse: {
    next: jest.fn().mockImplementation(() => ({
      headers: {
        set: jest.fn(),
      },
    })),
  },
}));

// Mock the domain-config module
jest.mock('../src/lib/domain-config', () => ({
  getDomainConfig: jest.fn().mockImplementation((domain) => {
    if (domain === 'testopsfactory.com') {
      return {
        siteId: 1,
        locale: 'en-US',
        apiEndpoint: 'https://testopsfactory.com/graphql',
      };
    } else if (domain === 'testopsfactory.fr') {
      return {
        siteId: 2,
        locale: 'fr-FR',
        apiEndpoint: 'https://testopsfactory.fr/graphql',
      };
    } else if (domain === 'pierrepellegrini.fr') {
      return {
        siteId: 3,
        locale: 'fr-FR',
        apiEndpoint: 'https://pierrepellegrini.fr/graphql',
      };
    }
    return {
      siteId: 1,
      locale: 'en-US',
      apiEndpoint: 'https://testopsfactory.com/graphql',
    };
  }),
}));

// Mock environment variables
process.env.NEXT_PUBLIC_DOMAINS = 'testopsfactory.com,testopsfactory.fr,pierrepellegrini.fr';
process.env.DOMAIN_MAPPING = JSON.stringify({
  'testopsfactory.com': 1,
  'testopsfactory.fr': 2,
  'pierrepellegrini.fr': 3,
});

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper function to create a mock request
  const createMockRequest = (hostname: string, path: string = '/'): NextRequest => {
    return {
      headers: {
        get: jest.fn().mockImplementation((name) => {
          if (name === 'host') return hostname;
          return null;
        }),
      },
      nextUrl: {
        pathname: path,
        clone: jest.fn().mockReturnThis(),
      },
    } as unknown as NextRequest;
  };

  test('should detect testopsfactory.com domain and set appropriate headers', () => {
    const req = createMockRequest('testopsfactory.com');
    const res = middleware(req);

    expect(getDomainConfig).toHaveBeenCalledWith('testopsfactory.com');
    expect(res.headers.set).toHaveBeenCalledWith('x-domain', 'testopsfactory.com');
    expect(res.headers.set).toHaveBeenCalledWith('x-wordpress-site-id', '1');
    expect(res.headers.set).toHaveBeenCalledWith('x-locale', 'en-US');
  });

  test('should detect testopsfactory.fr domain and set appropriate headers', () => {
    const req = createMockRequest('testopsfactory.fr');
    const res = middleware(req);

    expect(getDomainConfig).toHaveBeenCalledWith('testopsfactory.fr');
    expect(res.headers.set).toHaveBeenCalledWith('x-domain', 'testopsfactory.fr');
    expect(res.headers.set).toHaveBeenCalledWith('x-wordpress-site-id', '2');
    expect(res.headers.set).toHaveBeenCalledWith('x-locale', 'fr-FR');
  });

  test('should detect pierrepellegrini.fr domain and set appropriate headers', () => {
    const req = createMockRequest('pierrepellegrini.fr');
    const res = middleware(req);

    expect(getDomainConfig).toHaveBeenCalledWith('pierrepellegrini.fr');
    expect(res.headers.set).toHaveBeenCalledWith('x-domain', 'pierrepellegrini.fr');
    expect(res.headers.set).toHaveBeenCalledWith('x-wordpress-site-id', '3');
    expect(res.headers.set).toHaveBeenCalledWith('x-locale', 'fr-FR');
  });

  test('should handle unknown domains', () => {
    const req = createMockRequest('unknown-domain.com');
    const res = middleware(req);

    expect(getDomainConfig).toHaveBeenCalledWith('unknown-domain.com');
    expect(NextResponse.next).toHaveBeenCalled();
  });

  test('should skip middleware for API routes', () => {
    const req = createMockRequest('testopsfactory.com', '/api/graphql');
    middleware(req);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(getDomainConfig).not.toHaveBeenCalled();
  });

  test('should skip middleware for static files', () => {
    const req = createMockRequest('testopsfactory.com', '/images/logo.png');
    middleware(req);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(getDomainConfig).not.toHaveBeenCalled();
  });

  test('should skip middleware for Next.js internal routes', () => {
    const req = createMockRequest('testopsfactory.com', '/_next/static/chunks/main.js');
    middleware(req);

    expect(NextResponse.next).toHaveBeenCalled();
    expect(getDomainConfig).not.toHaveBeenCalled();
  });

  test('should handle domains with port numbers', () => {
    const req = createMockRequest('testopsfactory.com:3000');
    const res = middleware(req);

    expect(getDomainConfig).toHaveBeenCalledWith('testopsfactory.com');
    expect(res.headers.set).toHaveBeenCalledWith('x-domain', 'testopsfactory.com');
  });
});