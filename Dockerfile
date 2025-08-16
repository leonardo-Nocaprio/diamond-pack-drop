# Use Node 20 LTS (latest stable, compatible with Metaplex & Solana SDKs)
FROM node:20-alpine

# Install build tools (needed for native modules)
RUN apk add --no-cache python3 g++ make git

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json first for caching
COPY package*.json ./

# Install dependencies (production only)
RUN npm install --production

# Copy app source code
COPY . .

# Expose port (Railway will map dynamically via $PORT)
EXPOSE 4000

# Set environment variable for Railway dynamic port
ENV PORT=4000

# Start the app
CMD ["node", "index.js"]


