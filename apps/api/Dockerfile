FROM node:20-alpine AS builder

WORKDIR /app
RUN apk add --no-cache dumb-init
COPY package*.json ./
RUN npm install --legacy-peer-deps
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache dumb-init

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 apiuser

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

RUN mkdir -p /app/uploads && chown -R apiuser:nodejs /app/uploads
USER apiuser
EXPOSE 4000

CMD ["dumb-init", "node", "dist/server.js"]
