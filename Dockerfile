FROM node:6

RUN npm install -g forever

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app
RUN npm run bundle

EXPOSE 3000
CMD ["npm", "start"]
