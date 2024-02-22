FROM oven/bun:1.0.28 as build
WORKDIR /build

COPY src tsconfig.json tsconfig.build.json package.json ./
RUN bun install
RUN bun run build


FROM oven/bun:1.0.28 as module
WORKDIR /module

COPY src tsconfig.json tsconfig.build.json package.json ./
RUN bun install --production
RUN bun run build

FROM oven/bun:1.0.28-distroless AS dist
WORKDIR /app

COPY --from=build /build/dist ./dist
COPY --from=module /module/node_modules ./node_modules

ENTRYPOINT [ "bun", "run", "dist/index.js" ]