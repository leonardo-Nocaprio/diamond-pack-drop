# Use Node 20 (instead of 18)
FROM node:20

# Set working directory
WORKDIR /app/server

# Copy only package files first (for caching)
COPY server/package*.json ./

# Install dependencies
RUN npm install

# Copy backend code
COPY server/ .

# Copy wallet keypair into container
COPY wallet/ /app/server/wallet/

# Expose port (matches your Express server)
EXPOSE 4000

# Start backend
CMD ["npm", "start"]
