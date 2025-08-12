# Use full Debian-based Node image to avoid Alpine build issues
FROM node:20

# Create app directory
WORKDIR /app

# Copy dependency files first (better layer caching)
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application source
COPY . .

# Expose your app's port
EXPOSE 3000

# Start the app
CMD ["node", "server/index.js"]


