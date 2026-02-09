FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
#ci is clean install
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]