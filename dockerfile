FROM node as builder

COPY package.json package-lock.json ./
RUN npm install
COPY . .

FROM nginx
COPY --from=builder / /usr/share/nginx/html