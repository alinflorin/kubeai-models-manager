FROM node:25-alpine as builder
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci
COPY . .
ENV NODE_ENV=production
RUN npm run build

FROM node:25-alpine as runner
ENV NODE_ENV=production
WORKDIR /app
EXPOSE 3000
COPY --from=builder /app/dist /app/dist
CMD ["/app/dist/index.cjs"]