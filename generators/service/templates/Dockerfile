FROM node:argon
RUN mkdir -p /usr/src/
COPY . /usr/src/
WORKDIR /usr/src
RUN npm install
EXPOSE 80
CMD ["npm", "start"]