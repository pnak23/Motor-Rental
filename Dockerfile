# --- Build stage -----------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app

# sharp (image optimization) needs these at build time on some platforms
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Run stage ---------------------------------------------------------
FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production
ENV NITRO_PORT=3000
ENV NITRO_HOST=0.0.0.0

COPY --from=build /app/.output ./.output
COPY --from=build /app/public/uploads ./public/uploads

EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
