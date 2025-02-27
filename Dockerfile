# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package.json package-lock.json ./

# Install both dependencies and devDependencies (needed for TypeScript)
RUN npm install 

# Copy the rest of the app
COPY . .

# Expose port (match Express server)
EXPOSE 5051

# Build TypeScript files
RUN npm run build

# Use production dependencies only
RUN npm ci --omit=dev

# Start server (use "start" for production, "dev" for development)
CMD ["npm", "run", "start"]
