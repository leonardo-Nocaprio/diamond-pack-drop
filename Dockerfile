# Use Node.js 20 LTS
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Expose the port
EXPOSE 3000

# Health check (calls /healthz)
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3000/healthz || exit 1

# Run the server
CMD ["node", "index.js"]

