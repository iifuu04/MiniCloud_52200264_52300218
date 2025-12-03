FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./

# Cài deps đầy đủ cho build
RUN npm ci

# Build stage
FROM base AS builder
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app

# Cài production dependencies (chỉ deps thật sự cần)
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --silent

# Copy phần build từ builder
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["npm", "start"]
