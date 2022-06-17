#! Please keep in mind, this dockerfile is not recommended for production deployment!
#! For more information check Next.js official repo https://github.com/vercel/next.js/tree/canary/examples/with-docker

FROM node:18-alpine

RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./ 
RUN npm ci

COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build

ENV NODE_ENV production

EXPOSE 3000
ENV PORT 3000

CMD ["npm", "run", "start"]