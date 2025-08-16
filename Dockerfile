# Use Node 18
FROM node:18

# Set working directory
WORKDIR /app

# Copy package files (for caching)
COPY server/package*.json ./server/

# Install dependencies
WORKDIR /app/server
RUN npm install

# Copy backend source
COPY server/ /app/server/

# Copy wallet keypair
COPY wallet/ /app/server/wallet/

# Expose port
EXPOSE 4000

# Start backend
CMD ["node", "index.js"]




