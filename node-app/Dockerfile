# Use lightweight Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /usr/src/app

# Copy package.json first for better caching
COPY package*.json ./

RUN npm install

# Copy the rest of the application
COPY . .


# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "index.js"]
