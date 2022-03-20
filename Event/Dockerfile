FROM node:8

WORKDIR /project/Event

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)

COPY . .

# CMD npm install && npm start
RUN npm install
CMD npm start