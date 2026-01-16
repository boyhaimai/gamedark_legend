# Stage 1: Development
FROM node:18-alpine as production

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install
COPY . .

RUN yarn build
USER node
CMD ["node", "dist/main"]
