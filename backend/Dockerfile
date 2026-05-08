# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build the application (if you use TypeScript build step, uncomment below)
# RUN pnpm build

# Stage 2: Runtime
FROM node:20-alpine

WORKDIR /app

# Install pnpm (needed if you want to run via pnpm)
RUN npm install -g pnpm

# Copy only necessary files from builder
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/src ./src

# Expose port
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production

# Start the application
# Note: In production, we usually run the compiled JS from /dist
# But since this project uses ts-node or similar for dev, we'll use that or adjust based on your build
CMD ["pnpm", "dev"]
