# ========================================
# DOCKERFILE FOR NEXTJS WORDPRESS MULTISITE
# ========================================

# Stage 1: Building the application
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies for node-gyp and other build tools
RUN apk add --no-cache python3 make g++ git

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the application
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN npm run build

# Stage 2: Running the application
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Install production dependencies only
RUN apk add --no-cache curl

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy the built application from the builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy necessary files for runtime
COPY --chown=nextjs:nodejs next.config.js ./
COPY --chown=nextjs:nodejs .env.production ./.env.production

# Create health check endpoint directory
RUN mkdir -p ./pages/api
COPY --chown=nextjs:nodejs src/pages/api/health.js ./pages/api/

# Switch to non-root user
USER nextjs

# Expose the port the app will run on
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Command to run the application
CMD ["npm", "start"]