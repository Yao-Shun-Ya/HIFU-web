# 1) 依赖
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# 2) 构建（NEXT_PUBLIC_SITE_URL 在构建期生效，用 --build-arg 传入）
FROM node:24-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# 3) 运行（全站静态，但仍由 next start 提供 RSC 增量预取）
FROM node:24-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app ./
EXPOSE 3000
CMD ["sh", "-c", "npm run start -- -p $PORT"]
