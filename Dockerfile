FROM node:14
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
COPY . .
EXPOSE 9090
CMD npm start