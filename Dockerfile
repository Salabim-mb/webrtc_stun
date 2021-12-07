FROM node:lts
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3030:3030
CMD ['node', 'server.js']