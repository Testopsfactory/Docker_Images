/**
 * Authentication Module
 * 
 * This module handles user authentication and session management.
 * It integrates with WordPress user sessions via cookies and JWT tokens.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { GetServerSidePropsContext } from 'next';
import { getApiEndpoint } from './domain-config';

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  roles: string[];
  avatar?: string;
  meta?: Record<string, any>;
}

// Session interface
export interface Session {
  user: User | null;
  isLoggedIn: boolean;
  expiresAt: number;
  domain: string;
}

/**
 * Get the current user session
 * 
 * @param req - Next.js request object
 * @returns Session object
 */
export async function getSession(req: NextApiRequest | GetServerSidePropsContext['req']): Promise<Session> {
  try {
    // Get domain from request
    const host = req.headers.host || '';
    const domain = host.replace(/:\d+$/, ''); // Remove port if present
    
    // Get WordPress API endpoint for this domain
    const apiEndpoint = getApiEndpoint(domain);
    
    // Get authentication cookie from request
    const authCookie = getAuthCookie(req);
    
    if (!authCookie) {
      return createEmptySession(domain);
    }
    
    // Verify the session with WordPress
    const response = await fetch(`${apiEndpoint.replace('/graphql', '')}/wp-json/wp/v2/users/me`, {
      headers: {
        'Cookie': `${process.env.WP_AUTH_COOKIE_NAME || 'wordpress_logged_in'}=${authCookie}`,
      },
    });
    
    if (!response.ok) {
      return createEmptySession(domain);
    }
    
    const userData = await response.json();
    
    // Create user object from WordPress response
    const user: User = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.roles || [],
      avatar: userData.avatar_urls?.['96'] || '',
      meta: userData.meta || {},
    };
    
    // Calculate expiration time (24 hours from now)
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
    
    return {
      user,
      isLoggedIn: true,
      expiresAt,
      domain,
    };
  } catch (error) {
    console.error('Error getting session:', error);
    return createEmptySession(getHostFromRequest(req));
  }
}

/**
 * Set authentication cookie for the user
 * 
 * @param res - Next.js response object
 * @param token - Authentication token
 * @param domain - Domain for the cookie
 */
export function setAuthCookie(res: NextApiResponse, token: string, domain: string): void {
  const cookieName = process.env.WP_AUTH_COOKIE_NAME || 'wordpress_logged_in';
  const secure = process.env.NODE_ENV === 'production';
  const maxAge = 24 * 60 * 60; // 24 hours
  
  res.setHeader('Set-Cookie', `${cookieName}=${token}; Path=/; HttpOnly; ${secure ? 'Secure; ' : ''}SameSite=Lax; Domain=.${domain}; Max-Age=${maxAge}`);
}

/**
 * Clear authentication cookie
 * 
 * @param res - Next.js response object
 * @param domain - Domain for the cookie
 */
export function clearAuthCookie(res: NextApiResponse, domain: string): void {
  const cookieName = process.env.WP_AUTH_COOKIE_NAME || 'wordpress_logged_in';
  
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Domain=.${domain}`);
}

/**
 * Check if user has required role
 * 
 * @param user - User object
 * @param requiredRole - Required role
 * @returns True if user has the required role
 */
export function hasRole(user: User | null, requiredRole: string): boolean {
  if (!user) return false;
  return user.roles.includes(requiredRole);
}

/**
 * Check if user is an administrator
 * 
 * @param user - User object
 * @returns True if user is an administrator
 */
export function isAdmin(user: User | null): boolean {
  return hasRole(user, 'administrator');
}

// Helper functions

/**
 * Create an empty session
 * 
 * @param domain - Domain for the session
 * @returns Empty session object
 */
function createEmptySession(domain: string): Session {
  return {
    user: null,
    isLoggedIn: false,
    expiresAt: 0,
    domain,
  };
}

/**
 * Get authentication cookie from request
 * 
 * @param req - Next.js request object
 * @returns Authentication cookie value or null
 */
function getAuthCookie(req: NextApiRequest | GetServerSidePropsContext['req']): string | null {
  const cookieName = process.env.WP_AUTH_COOKIE_NAME || 'wordpress_logged_in';
  
  // Parse cookies from request
  const cookies = parseCookies(req);
  
  return cookies[cookieName] || null;
}

/**
 * Parse cookies from request
 * 
 * @param req - Next.js request object
 * @returns Object with cookie name-value pairs
 */
function parseCookies(req: NextApiRequest | GetServerSidePropsContext['req']): Record<string, string> {
  const cookies: Record<string, string> = {};
  const cookieHeader = req.headers.cookie;
  
  if (!cookieHeader) return cookies;
  
  cookieHeader.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    cookies[name] = value;
  });
  
  return cookies;
}

/**
 * Get host from request
 * 
 * @param req - Next.js request object
 * @returns Host domain
 */
function getHostFromRequest(req: NextApiRequest | GetServerSidePropsContext['req']): string {
  const host = req.headers.host || '';
  return host.replace(/:\d+$/, ''); // Remove port if present
}