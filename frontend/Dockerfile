# --- Stage 1: build the static site ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# The React app runs in the user's browser, not inside the Docker network, so
# it must call the backend's host-mapped port (localhost:8080), not the
# internal Compose service name - the browser has no visibility into that.
ENV VITE_API_BASE_URL=http://localhost:8080/api
RUN npm run build

# --- Stage 2: serve the built files with nginx ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
