FROM oven/bun:1.3 AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile
COPY . .

ARG DYNAMIC_ENV_ID
ARG PLATFORM_ETH_ADDRESS
ARG NEXT_PUBLIC_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
ENV NEXT_PUBLIC_DYNAMIC_ENV_ID=${DYNAMIC_ENV_ID}
ENV NEXT_PUBLIC_PLATFORM_ETH_ADDRESS=${PLATFORM_ETH_ADDRESS}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

RUN bun run build

FROM node:22-slim
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
ENV PORT=3000
CMD ["node", "server.js"]
