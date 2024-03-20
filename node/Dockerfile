FROM node:20.11.1
ENV NODE_ENV=production

WORKDIR /app

COPY node .

RUN npm install

CMD [ "npm", "start" ]