# Use Node 18
FROM node:18

# Set working directory inside container
WORKDIR /app

# Copy package files for caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy all backend code
COPY . .

# Copy environment file if needed
# (Uncomment if you keep a local .env you want in the container)
# COPY .env .env

# Expose port from .env or default 4000
EXPOSE 4000

# Start backend server
CMD ["node", "index.js"]
