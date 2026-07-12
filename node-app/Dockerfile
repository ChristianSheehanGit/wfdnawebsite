# Use official Node.js LTS Alpine image for smaller size
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# Copy app source
COPY . .

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 && \
    chown -R nextjs:nodejs /usr/src/app

# Switch to non-root user
USER nextjs

# Expose port (Cloud Run will override this anyway)
EXPOSE 8080

# Run the app
CMD ["npm", "start"]