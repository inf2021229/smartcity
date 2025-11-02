FROM node:16-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install -g serve

CMD ["serve", "-s", ".", "-l", "4000"]
