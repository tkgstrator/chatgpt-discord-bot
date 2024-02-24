FROM oven/bun:1.0.28 AS build
WORKDIR /app
COPY . .
RUN bun install --frozen-lockfile --production

FROM oven/bun:1.0.28-distroless
WORKDIR /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/src /app/src

ENTRYPOINT [ "bun", "run", "src/index.ts" ]