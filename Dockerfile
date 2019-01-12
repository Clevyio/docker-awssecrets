FROM node:8.15-alpine

WORKDIR /usr/bin/ci-secrets
COPY . .
RUN npm install -g .

CMD ["awssecrets"]
