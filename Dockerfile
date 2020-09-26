LABEL org.opencontainers.image.source https://github.com/spencerbeggs/gitflow-action-release-template
FROM mhart/alpine-node:14.8.0 as base
ENV NODE_ENV production
COPY package.json yarn.lock index.mjs /app/
RUN cd /app && yarn install --production=true --frozen-lockfile

FROM base as debug
CMD ["tail", "-f", "/dev/null"]

FROM base as run
CMD [ "node", "/app/index.mjs"]

FROM base as hub
CMD [ "node", "/app/index.mjs"]

