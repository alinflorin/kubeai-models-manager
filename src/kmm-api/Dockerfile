FROM node:25-alpine
WORKDIR /app
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci
ARG VERSION
COPY . .
RUN echo "export const version = '$VERSION';" > ./src/version.ts
USER appuser
EXPOSE 8080
CMD ["npm", "run", "start:prod"]
