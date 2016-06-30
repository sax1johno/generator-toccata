FROM node:argon

# Install nodemon
RUN npm install -g nodemon

# copy the source code and webapp to the webapp folder.
RUN mkdir -p /usr/src/
COPY package.json /usr/src
COPY config /usr/src/config
COPY app.js /usr/src
COPY public /usr/src/public

# install the app dependencies.
WORKDIR /usr/src
RUN npm install

ENV NODE_ENV "development"
ENV PORT 80
EXPOSE 80
CMD ["npm", "start"]