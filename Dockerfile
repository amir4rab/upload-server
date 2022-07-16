FROM node:18-alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Installing dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copying files
COPY . .

# Settings up env files
ENV DOCKER_BUILD 1
ENV NODE_ENV production

# Building the server
RUN npm run build

# Exposing ports
EXPOSE 6060
ENV PORT 6060

# Running the container
CMD ["npm", "run", "start"]