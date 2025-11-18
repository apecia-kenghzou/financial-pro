# Frontend Dockerfile
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for react-scripts
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci && npm cache clean --force

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Set environment to development
ENV NODE_ENV=development

# Start development server
CMD ["npm", "start"]
