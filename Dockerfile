#FROM nginx:alpine3.18
FROM node:20.9.0-alpine3.18

RUN apk update && apk add --no-cache bash 

USER node:node

WORKDIR /home/node

COPY --chown=node:node . .

RUN yarn && yarn build

STOPSIGNAL SIGINT

RUN chmod +x /home/node/start.sh

# Start the startup script
CMD ["/home/node/start.sh"]