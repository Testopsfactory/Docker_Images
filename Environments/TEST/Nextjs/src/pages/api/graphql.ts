/**
 * GraphQL API Route
 * 
 * This API route acts as a proxy to the WordPress GraphQL API.
 * It forwards requests to the appropriate WordPress site based on the domain.
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { getApiEndpoint } from '../../lib/domain-config';

/**
 * GraphQL API handler
 * 
 * @param req - Next.js API request
 * @param res - Next.js API response
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests for GraphQL
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Get the domain from the request headers
    const host = req.headers.host || '';
    const domain = host.replace(/:\d+$/, ''); // Remove port if present
    
    // Get the appropriate WordPress GraphQL endpoint for this domain
    const apiEndpoint = getApiEndpoint(domain);
    
    // Extract the GraphQL query from the request body
    const { query, variables, operationName } = req.body;
    
    if (!query) {
      return res.status(400).json({ message: 'GraphQL query is required' });
    }
    
    // Log the request in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log(`GraphQL request for domain: ${domain}`);
      console.log(`Forwarding to: ${apiEndpoint}`);
    }
    
    // Forward the request to the WordPress GraphQL API
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if present
        ...(req.headers.authorization 
          ? { 'Authorization': req.headers.authorization as string } 
          : {}),
      },
      body: JSON.stringify({
        query,
        variables,
        operationName,
      }),
    });
    
    // Get the response data
    const data = await response.json();
    
    // Return the response with the same status code
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('GraphQL proxy error:', error);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
}

/**
 * Configure the API route
 */
export const config = {
  api: {
    // Increase the payload size limit for large GraphQL queries
    bodyParser: {
      sizeLimit: '2mb',
    },
  },
};