FROM node:argon

# Copy package.json and install dependencies
COPY package.json /tmp/package.json
RUN cd /tmp && npm install

# Install forever
RUN npm install -g forever

# copy the source code and webapp to the webapp folder, along with already-install node modules.
RUN mkdir -p /usr/src && cp -a /tmp/node_modules /usr/src/

COPY package.json /usr/src
COPY config /usr/src/config
COPY app.js /usr/src
COPY public /usr/src/public

ENV PORT 80
EXPOSE 80
WORKDIR /usr/src
CMD ["npm", "start"]
