FROM mhart/alpine-node:14.12.0 as base
ENV NODE_ENV development
COPY package.json yarn.lock /app/
RUN cd /app && yarn install --frozen-lockfile

FROM base as dependencies
ENV NODE_ENV production
RUN cd /app && yarn install --frozen-lockfile

FROM base as build
ENV NODE_ENV development
COPY . /app/
RUN cd /app && yarn build

FROM mhart/alpine-node:slim-14.12.0 as deploy
LABEL org.opencontainers.image.source https://github.com/spencerbeggs/gitflow-action-release-template
ENV NODE_ENV production
COPY --from=dependencies /app/node_modules/ /app/
COPY --from=build /app/dist/ /app/
CMD [ "node", "/app/index.mjs"]

