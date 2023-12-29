#FROM nginx:alpine3.18
FROM node:20.9.0-alpine3.18

WORKDIR /home/node
COPY --chown=node:node . .

RUN apk update && apk add --no-cache bash nginx openssl && \
        rm /etc/nginx/http.d/default.conf && \
        mv /home/node/default.conf /etc/nginx/http.d/ && \
        chmod +x /home/node/start.sh && \
        npm install -g yarn@latest --force && \
        yarn upgrade --no-cache && \
        yarn build 
    

STOPSIGNAL SIGINT
# Start the startup script
CMD ["/home/node/start.sh"]