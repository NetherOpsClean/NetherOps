# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS base
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    npm pkg delete scripts.prepare && \
    npm pkg delete scripts.postinstall && \
    pnpm install --frozen-lockfile --prod --ignore-scripts

FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    npm pkg delete scripts.prepare && \
    pnpm config set config.ignore-scripts false && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm prisma generate
RUN pnpm run build

FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
