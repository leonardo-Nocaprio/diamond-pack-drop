# Use Node.js base
FROM node:20-alpine

WORKDIR /app

# Copy package.json and install
COPY package*.json ./
RUN npm install --production

# Copy everything else
COPY . .

EXPOSE 3000

# Start at runtime, not build time
CMD ["node", "server/index.js"]
