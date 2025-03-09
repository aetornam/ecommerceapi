# Use official Node.js image
FROM node:18

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies and required build tools for bcrypt
RUN apt-get update && apt-get install -y python3 make g++ \
    && npm install \
    && npm rebuild bcrypt --build-from-source \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application files
COPY . .

# Expose the application port
EXPOSE 5051

# Start the application
CMD ["npm", "run", "dev"]
