# Stage 1: Build Vite app
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./
# Include devDependencies (vite, typescript) even if NODE_ENV=production
RUN npm install --legacy-peer-deps --include=dev

# Copy source
COPY . .

# Build args for API URL (must be set at build time for Vite)
ARG VITE_API_URL=https://hris.baitulquranalikhwan.cloud
ENV VITE_API_URL=$VITE_API_URL

# Build static assets
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine AS runner

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config for SPA routing (handle client-side routes)
RUN printf 'server {\n\
    listen 80;\n\
    server_name _;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    # Handle client-side routing (React Router)\n\
    location / {\n\
        try_files $uri $uri/ /index.html;\n\
    }\n\
\n\
    # Cache static assets\n\
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {\n\
        expires 1y;\n\
        add_header Cache-Control "public, immutable";\n\
    }\n\
\n\
    gzip on;\n\
    gzip_types text/plain application/javascript text/css application/json;\n\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80



CMD ["nginx", "-g", "daemon off;"]
