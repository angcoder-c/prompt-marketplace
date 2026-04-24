FROM node:20-alpine

RUN apk add --no-cache sqlite-tools

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p /app/data

COPY db/*.sql /db/

CMD ["sh", "/db/init.sh", "&&", "npm", "start"]