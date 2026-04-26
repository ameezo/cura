# ---- Development Stage ----
FROM node:20-alpine

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy the rest of the source code
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server with hot reload, accessible from outside container
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
