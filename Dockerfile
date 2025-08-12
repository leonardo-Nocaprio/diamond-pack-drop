# -------------------
# Build Stage
# -------------------
FROM node:20 AS build

# Create and set working directory
WORKDIR /app

# Copy package files first (better caching for deps)
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Copy the rest of the application
COPY . .

# -------------------
# Runtime Stage
# -------------------
FROM node:20 AS runtime

WORKDIR /app

# Copy only needed files from build stage
COPY --from=build /app /app

# Expose app port (change if not 3000)
EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
