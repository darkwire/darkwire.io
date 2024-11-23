# builder: Builder For Darkwore
FROM --platform=$BUILDPLATFORM node:current-alpine AS builder



# Client configuration will be put into client/.env
ENV TZ=UTC \
    VITE_COMMIT_SHA=terra-firma

WORKDIR /opt/app
COPY  . . 
RUN     npm install -g yarn@latest --force \
        && yarn install --flat --production --no-cache \
        && yarn build --no-cache \
        && rm -rf /opt/app/node_modules \
        && yarn cache clean \
        && yarn autoclean --force

# final: Final Darkwire Image
FROM alpine:latest

WORKDIR /opt/app

RUN apk add --no-cache nginx yarn openssl iptables
COPY --from=builder /opt/app/client/dist /opt/app/client/dist
COPY --from=builder /opt/app/server /opt/app/server
COPY package.json /opt/app/package.json
COPY default.conf /etc/nginx/http.d/
COPY start.sh /opt/app/start.sh


RUN  chmod +x /opt/app/start.sh

    
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 CMD \
    sh -c 'pgrep nginx > /dev/null && pgrep node > /dev/null' || exit 1

CMD ["/opt/app/start.sh", "start" ]

STOPSIGNAL SIGTERM
