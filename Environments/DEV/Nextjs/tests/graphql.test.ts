/**
 * Tests for the GraphQL API route
 */

import { createMocks } from 'node-mocks-http';
import handler from '../src/pages/api/graphql';
import { getApiEndpoint } from '../src/lib/domain-config';

// Mock the domain-config module
jest.mock('../src/lib/domain-config', () => ({
  getApiEndpoint: jest.fn().mockImplementation((domain) => {
    if (domain === 'testopsfactory.com') {
      return 'https://testopsfactory.com/graphql';
    } else if (domain === 'testopsfactory.fr') {
      return 'https://testopsfactory.fr/graphql';
    } else if (domain === 'pierrepellegrini.fr') {
      return 'https://pierrepellegrini.fr/graphql';
    }
    return 'https://testopsfactory.com/graphql';
  }),
}));

// Mock the global fetch function
global.fetch = jest.fn();

describe('GraphQL API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return 405 for non-POST requests', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(405);
    expect(res._getJSONData()).toEqual({ message: 'Method not allowed' });
  });

  test('should return 400 if query is missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.com',
      },
      body: {},
    });

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ message: 'GraphQL query is required' });
  });

  test('should forward request to the correct WordPress GraphQL endpoint for testopsfactory.com', async () => {
    // Mock successful response from WordPress
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ data: { posts: [] } }),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.com',
        'content-type': 'application/json',
      },
      body: {
        query: '{ posts { nodes { id title } } }',
      },
    });

    await handler(req, res);

    expect(getApiEndpoint).toHaveBeenCalledWith('testopsfactory.com');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://testopsfactory.com/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({
          query: '{ posts { nodes { id title } } }',
          variables: undefined,
          operationName: undefined,
        }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ data: { posts: [] } });
  });

  test('should forward request to the correct WordPress GraphQL endpoint for testopsfactory.fr', async () => {
    // Mock successful response from WordPress
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ data: { posts: [] } }),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.fr',
        'content-type': 'application/json',
      },
      body: {
        query: '{ posts { nodes { id title } } }',
      },
    });

    await handler(req, res);

    expect(getApiEndpoint).toHaveBeenCalledWith('testopsfactory.fr');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://testopsfactory.fr/graphql',
      expect.anything()
    );
    expect(res.statusCode).toBe(200);
  });

  test('should forward request to the correct WordPress GraphQL endpoint for pierrepellegrini.fr', async () => {
    // Mock successful response from WordPress
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ data: { posts: [] } }),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'pierrepellegrini.fr',
        'content-type': 'application/json',
      },
      body: {
        query: '{ posts { nodes { id title } } }',
      },
    });

    await handler(req, res);

    expect(getApiEndpoint).toHaveBeenCalledWith('pierrepellegrini.fr');
    expect(global.fetch).toHaveBeenCalledWith(
      'https://pierrepellegrini.fr/graphql',
      expect.anything()
    );
    expect(res.statusCode).toBe(200);
  });

  test('should forward variables and operationName if provided', async () => {
    // Mock successful response from WordPress
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ data: { post: { title: 'Test Post' } } }),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.com',
        'content-type': 'application/json',
      },
      body: {
        query: 'query GetPost($id: ID!) { post(id: $id) { title } }',
        variables: { id: '123' },
        operationName: 'GetPost',
      },
    });

    await handler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://testopsfactory.com/graphql',
      expect.objectContaining({
        body: JSON.stringify({
          query: 'query GetPost($id: ID!) { post(id: $id) { title } }',
          variables: { id: '123' },
          operationName: 'GetPost',
        }),
      })
    );
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual({ data: { post: { title: 'Test Post' } } });
  });

  test('should forward authorization header if present', async () => {
    // Mock successful response from WordPress
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ data: { viewer: { name: 'Test User' } } }),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.com',
        'content-type': 'application/json',
        authorization: 'Bearer test-token',
      },
      body: {
        query: '{ viewer { name } }',
      },
    });

    await handler(req, res);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://testopsfactory.com/graphql',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-token',
        }),
      })
    );
    expect(res.statusCode).toBe(200);
  });

  test('should handle WordPress GraphQL errors', async () => {
    // Mock error response from WordPress
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 400,
      json: jest.fn().mockResolvedValue({
        errors: [{ message: 'Invalid query' }],
      }),
    });

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.com',
      },
      body: {
        query: '{ invalid { query } }',
      },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({
      errors: [{ message: 'Invalid query' }],
    });
  });

  test('should handle network errors', async () => {
    // Mock network error
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

    const { req, res } = createMocks({
      method: 'POST',
      headers: {
        host: 'testopsfactory.com',
      },
      body: {
        query: '{ posts { nodes { id title } } }',
      },
    });

    await handler(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ message: 'Erreur serveur' });
  });
});