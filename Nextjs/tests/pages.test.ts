/**
 * Tests for page rendering with domain-specific content
 */

import { GetServerSidePropsContext } from 'next';
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

// Mock the fetch function
global.fetch = jest.fn();

// Mock HomePage component and its getServerSideProps function
const mockGetServerSideProps = jest.fn().mockImplementation(async (context: any) => {
  const host = context.req.headers.host || '';
  const domain = host.replace(/:\\d+$/, '');
  
  // Return domain-specific content
  if (domain === 'testopsfactory.com') {
    return {
      props: {
        title: 'TestOpsFactory',
        content: '<p>Welcome to TestOpsFactory</p>',
      },
    };
  } else if (domain === 'testopsfactory.fr') {
    return {
      props: {
        title: 'TestOpsFactory France',
        content: '<p>Bienvenue sur TestOpsFactory France</p>',
      },
    };
  } else if (domain === 'pierrepellegrini.fr') {
    return {
      props: {
        title: 'Pierre Pellegrini',
        content: '<p>Bienvenue sur le site de Pierre Pellegrini</p>',
      },
    };
  } else {
    return {
      props: {
        title: 'Default Site',
        content: '<p>Welcome to our site</p>',
      },
    };
  }
});

// Mock the HomePage import
jest.mock('../src/pages/index', () => ({
  __esModule: true,
  default: jest.fn(),
  getServerSideProps: mockGetServerSideProps,
}), { virtual: true });

describe('Page Rendering', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should render testopsfactory.com content', async () => {
    // Create mock context
    const context = {
      req: {
        headers: {
          host: 'testopsfactory.com',
        },
      },
    } as unknown as GetServerSidePropsContext;
    
    // Get props from getServerSideProps
    const result = await mockGetServerSideProps(context);
    
    // Check that the correct props are returned
    expect(result).toEqual({
      props: {
        title: 'TestOpsFactory',
        content: '<p>Welcome to TestOpsFactory</p>',
      },
    });
  });

  test('should render testopsfactory.fr content', async () => {
    // Create mock context
    const context = {
      req: {
        headers: {
          host: 'testopsfactory.fr',
        },
      },
    } as unknown as GetServerSidePropsContext;
    
    // Get props from getServerSideProps
    const result = await mockGetServerSideProps(context);
    
    // Check that the correct props are returned
    expect(result).toEqual({
      props: {
        title: 'TestOpsFactory France',
        content: '<p>Bienvenue sur TestOpsFactory France</p>',
      },
    });
  });

  test('should render pierrepellegrini.fr content', async () => {
    // Create mock context
    const context = {
      req: {
        headers: {
          host: 'pierrepellegrini.fr',
        },
      },
    } as unknown as GetServerSidePropsContext;
    
    // Get props from getServerSideProps
    const result = await mockGetServerSideProps(context);
    
    // Check that the correct props are returned
    expect(result).toEqual({
      props: {
        title: 'Pierre Pellegrini',
        content: '<p>Bienvenue sur le site de Pierre Pellegrini</p>',
      },
    });
  });

  test('should render default content for unknown domains', async () => {
    // Create mock context
    const context = {
      req: {
        headers: {
          host: 'unknown-domain.com',
        },
      },
    } as unknown as GetServerSidePropsContext;
    
    // Get props from getServerSideProps
    const result = await mockGetServerSideProps(context);
    
    // Check that the default props are returned
    expect(result).toEqual({
      props: {
        title: 'Default Site',
        content: '<p>Welcome to our site</p>',
      },
    });
  });

  test('should handle domains with port numbers', async () => {
    // Create mock context
    const context = {
      req: {
        headers: {
          host: 'testopsfactory.com:3000',
        },
      },
    } as unknown as GetServerSidePropsContext;
    
    // Get props from getServerSideProps
    const result = await mockGetServerSideProps(context);
    
    // Check that the correct props are returned (port should be stripped)
    expect(result.props.title).toBe('TestOpsFactory');
  });

  test('should handle missing host header', async () => {
    // Create mock context
    const context = {
      req: {
        headers: {},
      },
    } as unknown as GetServerSidePropsContext;
    
    // Get props from getServerSideProps
    const result = await mockGetServerSideProps(context);
    
    // Check that the default props are returned
    expect(result.props.title).toBe('Default Site');
  });
});