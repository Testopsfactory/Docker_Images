/**
 * Health check endpoint for Next.js
 * 
 * This endpoint is used by Kubernetes to check if the application is running correctly.
 * It returns a 200 OK status if the application is healthy.
 */

export default function handler(req, res) {
  // Check if the application is running
  const isHealthy = true;

  if (isHealthy) {
    // Return 200 OK if the application is healthy
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      message: 'Next.js application is running correctly'
    });
  } else {
    // Return 503 Service Unavailable if the application is not healthy
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      message: 'Next.js application is not healthy'
    });
  }
}