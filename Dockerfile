FROM node:24-bookworm-slim AS build

WORKDIR /build
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/package.json
RUN pnpm install --frozen-lockfile
COPY web/ ./web/
RUN pnpm --dir web build

FROM node:24-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3100 \
    DB_PATH=/app/data/crosspilot.db

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/package.json
RUN corepack enable && corepack prepare pnpm@11.19.0 --activate && pnpm install --prod --frozen-lockfile --filter .
COPY src ./src
COPY public ./public

COPY --from=build /build/web/dist ./web/dist

RUN mkdir -p /app/data && chown -R node:node /app

USER node

EXPOSE 3100

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3100/api/health').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
