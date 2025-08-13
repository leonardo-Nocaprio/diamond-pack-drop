# Use Node base image
FROM node:18

WORKDIR /app

# Copy package.json and lock file
COPY package*.json ./
RUN npm install --production

# Copy all files
COPY . .

# Expose the port
EXPOSE 4000

# Start the server at runtime
CMD ["node", "server/index.js"]
