FROM node:25-alpine
WORKDIR /app
COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json
RUN npm ci
COPY . .
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", "/app/dist/index.cjs"]