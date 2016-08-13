FROM node:argon

# Copy package.json and install dependencies
COPY package.json /tmp/package.json
RUN cd /tmp && npm install

# copy the source code and webapp to the webapp folder, along with already-install node modules.
RUN mkdir -p /usr/src && cp -a /tmp/node_modules /usr/src/

COPY . /usr/src/
WORKDIR /usr/src
EXPOSE <%= port %>
CMD ["npm", "start"]