FROM node:14.7.0-stretch

# Installing yarn
RUN apt update -y && \ 
    apt install yarn=v1.22.4 -v -y

USER node:node

# Server environmental variables will be put into server/.env
ENV MAILGUN_API_KEY=api-key \
    MAILGUN_DOMAIN=darkwire.io \
    ABUSE_TO_EMAIL_ADDRESS=abuse@darkwire.io \
    ABUSE_FROM_EMAIL_ADDRESS="Darkwire <no-reply@darkwire.io>" \
    CLIENT_DIST_DIRECTORY='client/dist/path'\
    ROOM_HASH_SECRET='some-uuid'\
    SITE_URL=https://darkwire.io \
    STORE_BACKEND=redis \
    STORE_HOST=redis://redis:6379

# Client configuration will be put into client/.env
ENV TZ=UTC \
    REACT_APP_API_HOST=localhost \
    REACT_APP_API_PROTOCOL=http \
    REACT_APP_API_PORT=3001 \
    REACT_APP_COMMIT_SHA=some_sha \
    REACT_APP_COMMIT_SHA=some_sha \
    REACT_APP_MAX_FILE_SIZE=4 

COPY --chown=node:node . .

RUN yarn build

STOPSIGNAL SIGINT
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=30s --start-period=10s --retries=3 \ 
    CMD [ "curl", "-f", "${REACT_APP_API_PROTOCOL}://localhost:${REACT_APP_API_PORT}", "||", "exit", "1" ]

ENTRYPOINT [ "docker-entrypoint.sh" ]
CMD ["yarn", "start"]