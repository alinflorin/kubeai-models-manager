FROM node:25-alpine as builder
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:25-alpine as runner
WORKDIR /app
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
ENV NODE_ENV=production
CMD "node /app/dist/api/index.cjs"