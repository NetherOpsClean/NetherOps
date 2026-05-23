# syntax=docker/dockerfile:1.4
FROM node:22-alpine AS base
# Instalamos las herramientas de compilación nativas para node-gyp
RUN apk add --no-cache python3 make g++

RUN corepack enable && corepack prepare pnpm@10.8.1 --activate
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

# ---------------------------------------------------
# ETAPA 1: Dependencias de Producción
# ---------------------------------------------------
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
# Usamos --ignore-scripts a nivel global de pnpm para garantizar que NO se ejecute el postinstall ni scripts de dependencias.
# Esto previene el error "sh: prisma: not found"
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    npm pkg delete scripts.prepare && \
    npm pkg delete scripts.postinstall && \
    pnpm install --frozen-lockfile --prod --ignore-scripts

# ---------------------------------------------------
# ETAPA 2: Construcción y Generación (Builder)
# ---------------------------------------------------
FROM base AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

# Aquí SÍ queremos que se ejecute el postinstall para generar Prisma,
# pero solo permitimos scripts de las dependencias que lo requieran (como cpu-features o Prisma)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
    npm pkg delete scripts.prepare && \
    pnpm config set config.ignore-scripts false && \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# ---------------------------------------------------
# ETAPA 3: Producción (Imagen Final)
# ---------------------------------------------------
FROM node:22-alpine AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

# Copiamos el cliente generado
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

EXPOSE 3000
CMD ["node", "dist/main.js"]
