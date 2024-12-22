# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the frontend application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Instalar Nginx
RUN apk add --no-cache nginx

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy built frontend assets
COPY --from=builder /app/dist ./dist

# Copy server files
COPY server ./server

# Copy nginx configuration
COPY nginx.conf ./nginx.conf

# Expose ports for both frontend and backend
EXPOSE 80 3000

# Create start script
RUN echo -e '#!/bin/sh\nnginx -c /app/nginx.conf -g "daemon off;" & node server/index.js' > start.sh  && \
chmod +x start.sh

# Start both nginx and node server
CMD ["./start.sh"]