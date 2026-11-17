FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build args for Vite
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_API_URL
ARG VITE_BACKEND_URL
ARG VITE_SOCKET_URL
ARG VITE_APP_URL

ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_APP_URL=$VITE_APP_URL

# Build the app
RUN npm run build

# ---
FROM nginx:alpine AS production

# Copy the build output to replace the default nginx contents
COPY --from=builder /app/dist /usr/share/nginx/html

# Custom nginx config: SPA routes -> index.html, unknown paths -> 404.html (HTTP 404)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
