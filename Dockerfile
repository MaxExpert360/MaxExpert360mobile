# Build and runtime stage for MaxExpert360 Cloud Run Backend
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors
COPY package*.json ./

# Install all dependencies (including devDependencies for esbuild/vite build step)
RUN npm ci

# Copy source files
COPY . .

# Build application (frontend assets + bundled dist/server.cjs)
RUN npm run build

# Set environment
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.cjs"]
