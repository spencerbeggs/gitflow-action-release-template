FROM mhart/alpine-node:14.12.0 as base
COPY package.json yarn.lock /app/

FROM base as dependencies
ENV NODE_ENV development
RUN cd /app && yarn install --frozen-lockfile

FROM dependencies as build
ENV NODE_ENV development
COPY --from=base /app/node_modules/ /app/
COPY . /app/
RUN cd /app && yarn build

FROM build as test
ENV NODE_ENV production
CMD [ "node", "/app/index.mjs"]

FROM mhart/alpine-node:slim-14.12.0 as deploy
LABEL org.opencontainers.image.source https://github.com/spencerbeggs/gitflow-action-release-template
ENV NODE_ENV production
COPY --from=build /app/dist/ /app/
RUN cd /app && yarn install --frozen-lockfile
CMD [ "node", "/app/index.mjs"]

