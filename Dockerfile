FROM oven/bun:1.0.28-distroless AS dist
WORKDIR /app
COPY src src

ENTRYPOINT [ "bun", "run", "src/index.ts" ]