# Use Node 18
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy backend package files first to leverage Docker cache
COPY server/package*.json ./server/

# Install backend dependencies
WORKDIR /app/server
RUN npm install --production

# Copy the backend code
COPY server/ /app/server

# Expose port (change if needed)
EXPOSE 3000

# Start backend server
CMD ["node", "index.js"]


