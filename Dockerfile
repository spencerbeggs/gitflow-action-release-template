FROM mhart/alpine-node:14.8.0 as base
ENV NODE_ENV development
COPY package.json yarn.lock /app/
RUN cd /app && yarn install --frozen-lockfile

FROM base as build
ENV NODE_ENV development
COPY --from=base /app/node_modules/ /app/
COPY . /app/
RUN cd /app && yarn build

FROM build as test
ENV NODE_ENV production
CMD [ "node", "/app/index.mjs"]

FROM base as deploy
LABEL org.opencontainers.image.source https://github.com/spencerbeggs/gitflow-action-release-template
ENV NODE_ENV production
RUN cd /app && yarn install --frozen-lockfile
COPY --from=build /app/dist/ /app/
CMD [ "node", "/app/index.mjs"]

