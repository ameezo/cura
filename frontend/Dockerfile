# ─────────────────────────────────────────────────────────────
# Stage 1 — Build React app with Vite
# ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests first (better layer caching)
COPY package.json package-lock.json* ./
RUN npm ci --silent

# Pass the API URL at build time so Vite bakes it into the bundle
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Copy source and build
COPY . .
RUN npm run build

# ─────────────────────────────────────────────────────────────
# Stage 2 — Serve with Nginx (production)
# ─────────────────────────────────────────────────────────────
FROM nginx:stable-alpine AS production

# Copy the compiled React SPA
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
