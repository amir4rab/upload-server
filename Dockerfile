FROM node:18-alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app
COPY package.json package-lock.json ./ 
RUN npm ci

COPY . .
ENV DOCKER_BUILD 1
RUN npm run build

EXPOSE 6060
ENV PORT 6060

CMD ["npm", "run", "start"]