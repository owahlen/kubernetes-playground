FROM node:14

# Create app directory
WORKDIR /usr/src/app

# The wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json tsconfig.json tslint.json ./
COPY ./src ./src

# Install app dependencies and build
RUN npm ci --quiet && npm run build

EXPOSE 8080
CMD [ "node", "." ]
