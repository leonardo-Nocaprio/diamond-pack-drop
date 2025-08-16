# Use Node 18
FROM node:18

# Set working directory
WORKDIR /app/server

# Copy only package files first (for caching)
COPY server/package*.json ./

# Install all deps (not just production — avoids build errors)
RUN npm install

# Copy backend code
COPY server/ .

# Copy wallet keypair into container
COPY wallet/ /app/server/wallet/

# Expose port
EXPOSE 4000

# Start backend
CMD ["node", "index.js"]




