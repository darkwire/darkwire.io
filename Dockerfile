# Stage 1: Build Stage
FROM node:alpine3.19 AS builder

WORKDIR /home/node
COPY --chown=node:node . .

RUN apk update \
        && apk add --no-cache bash \
        && chmod +x /home/node/start.sh \
        && npm install -g yarn@latest --force \
        && yarn install --flat --production --no-cache \
        && yarn build --no-cache \
        && rm -rf /home/node/node_modules \
        && yarn cache clean \
        && yarn autoclean --force

# Stage 2: Production Stage
FROM node:alpine3.19

WORKDIR /home/node
COPY --from=builder /home/node .

RUN apk add --no-cache nginx openssl && \
    rm /etc/nginx/http.d/default.conf && \
    mv /home/node/default.conf /etc/nginx/http.d/ && \
    chmod +x /home/node/start.sh

STOPSIGNAL SIGINT

HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \ 
    CMD [ "curl", "-f", "${VITE_API_PROTOCOL}://localhost:${VITE_API_PORT}", "||", "exit", "1" ]

CMD ["/home/node/start.sh"]