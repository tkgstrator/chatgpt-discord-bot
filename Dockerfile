FROM node:18.17.1-slim as build
WORKDIR /build

COPY src ./src/
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY package.json .
COPY yarn.lock .
COPY .eslintrc.yaml .
COPY .prettierrc.yaml .
COPY .yarnrc.yaml .

RUN yarn install
RUN yarn build

FROM node:18.17.1-slim as module
WORKDIR /module

COPY src ./src/
COPY tsconfig.json .
COPY tsconfig.build.json .
COPY package.json .
COPY yarn.lock .
COPY .eslintrc.yaml .
COPY .prettierrc.yaml .
COPY .yarnrc.yaml .

RUN yarn install --prod

FROM gcr.io/distroless/nodejs18-debian12 AS dist
WORKDIR /app

COPY --from=build /build/dist ./dist
COPY --from=build /build/package.json ./
COPY --from=module /module/node_modules ./node_modules

CMD ["dist/src/index"]