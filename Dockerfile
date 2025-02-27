# Use Node.js as base image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json  package-lock.json ./
RUN npm install --frozen-lockfile

# Copy the rest of the app
COPY . .

# Expose port (match Express server)
EXPOSE 5051

# Start server
CMD ["npm", "start"]
