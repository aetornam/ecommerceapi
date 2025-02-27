# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json  package-lock.json ./
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port (match Express server)
EXPOSE 5051

RUN npm run build
# Start server
CMD ["npm", "run", "dev"] 
# Change to ["npm", "run", "start"] for development

