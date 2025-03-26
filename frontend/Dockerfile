# Use Node.js for building the frontend
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile

# Copy project files
COPY . .

# Build the app
RUN npm run build

# Serve with NGINX
FROM nginx:1.25.3-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose the port
EXPOSE 80

# Start NGINX server
CMD ["nginx", "-g", "daemon off;"]
