/**
 * Domain Configuration Module
 * 
 * This module provides functions to get configuration for different domains
 * in the WordPress multisite setup.
 */

// Type definition for domain configuration
export interface DomainConfig {
  // WordPress site ID for this domain
  siteId: number;
  // Default locale for this domain
  locale: string;
  // API endpoint for this domain
  apiEndpoint: string;
  // Theme configuration
  theme?: {
    // Primary color for the domain
    primaryColor: string;
    // Secondary color for the domain
    secondaryColor: string;
    // Logo path for the domain
    logo: string;
  };
}

// Default configuration used when a domain is not found
const DEFAULT_CONFIG: DomainConfig = {
  siteId: 1,
  locale: 'en-US',
  apiEndpoint: process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://testopsfactory.com/graphql',
  theme: {
    primaryColor: '#0070f3',
    secondaryColor: '#ff4081',
    logo: '/images/logo-default.svg',
  },
};

// Domain-specific configurations
const domainConfigs: Record<string, DomainConfig> = {
  'testopsfactory.com': {
    siteId: 1,
    locale: 'en-US',
    apiEndpoint: 'https://testopsfactory.com/graphql',
    theme: {
      primaryColor: '#0070f3',
      secondaryColor: '#ff4081',
      logo: '/images/logo-testopsfactory-com.svg',
    },
  },
  'testopsfactory.fr': {
    siteId: 2,
    locale: 'fr-FR',
    apiEndpoint: 'https://testopsfactory.fr/graphql',
    theme: {
      primaryColor: '#3f51b5',
      secondaryColor: '#ff9800',
      logo: '/images/logo-testopsfactory-fr.svg',
    },
  },
  'pierrepellegrini.fr': {
    siteId: 3,
    locale: 'fr-FR',
    apiEndpoint: 'https://pierrepellegrini.fr/graphql',
    theme: {
      primaryColor: '#4caf50',
      secondaryColor: '#ff5722',
      logo: '/images/logo-pierrepellegrini-fr.svg',
    },
  },
};

/**
 * Get configuration for a specific domain
 * 
 * @param domain - The domain to get configuration for
 * @returns Domain configuration object
 */
export function getDomainConfig(domain: string): DomainConfig {
  // Remove www. prefix if present
  const normalizedDomain = domain.replace(/^www\./, '');
  
  // Return domain-specific config or default config
  return domainConfigs[normalizedDomain] || DEFAULT_CONFIG;
}

/**
 * Get all configured domains
 * 
 * @returns Array of all configured domains
 */
export function getAllDomains(): string[] {
  return Object.keys(domainConfigs);
}

/**
 * Get site ID for a specific domain
 * 
 * @param domain - The domain to get site ID for
 * @returns WordPress site ID
 */
export function getSiteId(domain: string): number {
  return getDomainConfig(domain).siteId;
}

/**
 * Get API endpoint for a specific domain
 * 
 * @param domain - The domain to get API endpoint for
 * @returns GraphQL API endpoint URL
 */
export function getApiEndpoint(domain: string): string {
  return getDomainConfig(domain).apiEndpoint;
}