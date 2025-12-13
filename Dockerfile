FROM node:22-alpine AS base
WORKDIR /app

COPY public ./public
COPY .next/standalone ./
COPY .next/static ./.next/static

ARG NEXT_PUBLIC_BUILD_TAG
ENV NEXT_PUBLIC_BUILD_TAG=$NEXT_PUBLIC_BUILD_TAG

EXPOSE 3000

CMD ["node", "server.js"]
