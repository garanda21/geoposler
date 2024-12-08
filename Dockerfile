# Stage 1: Build Node.js environment
FROM node:18.20.3 AS builder

# Set working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies (including Nodemailer)
RUN npm install express cors nodemailer @types/express @types/cors

# Copy application files
COPY . .

# Build the application (if applicable)
RUN npm run build

# Stage 2: Production environment with Node.js and Nginx
FROM nginx:alpine AS production

# Copy built files to Nginx volume (if applicable)
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

# Install Node.js runtime (optional, depending on Nginx configuration)
# Consider removing this line if Nginx serves static files only
RUN apk add --no-cache nodejs

# Copy Nodemailer server code
#COPY --from=builder server/index.js /usr/share/nginx/html/server/index.js

# Expose port 80
EXPOSE 80 3000

# Command to start Nginx and Node.js server
CMD ["nginx", "-g", "daemon off;"] & node /usr/share/nginx/html/server/index.js