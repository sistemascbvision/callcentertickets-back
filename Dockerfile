FROM node:22-alpine

WORKDIR /app

COPY . .

RUN npm install 

EXPOSE 3000

CMD ["npm", "start"]

# COPY package.json package-lock.json ./
# RUN npm ci