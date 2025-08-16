# Use Node 18
FROM node:18

# Set working directory
WORKDIR /app/server

# Copy only package files first
COPY server/package*.json ./

# Install deps
RUN npm install

# Copy backend code
COPY server/ .

# Copy wallet
COPY wallet/ /app/server/wallet/

# Railway sets PORT env automatically
EXPOSE 4000

# Start app
CMD ["npm", "start"]
