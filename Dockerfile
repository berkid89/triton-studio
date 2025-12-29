FROM node:20-alpine AS development-dependencies-env
# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++
COPY . /app
WORKDIR /app
RUN npm ci

FROM node:20-alpine AS production-dependencies-env
# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++
COPY ./package.json package-lock.json /app/
WORKDIR /app
RUN npm ci --omit=dev

FROM node:20-alpine AS build-env
# Install build dependencies for native modules (better-sqlite3)
RUN apk add --no-cache python3 make g++
COPY . /app/
COPY --from=development-dependencies-env /app/node_modules /app/node_modules
WORKDIR /app
RUN npm run build

FROM node:20-alpine
# Install runtime dependencies for better-sqlite3
RUN apk add --no-cache libc6-compat
# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
COPY ./package.json package-lock.json /app/
COPY --from=production-dependencies-env /app/node_modules /app/node_modules
COPY --from=build-env /app/build /app/build
WORKDIR /app
# Change ownership to non-root user
RUN chown -R nodejs:nodejs /app
USER nodejs
# Expose port (React Router Serve defaults to 3000, configurable via PORT env var)
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "run", "start"]