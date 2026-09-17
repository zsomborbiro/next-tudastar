# Build: tesztek + generálás. Ha bármelyik őrző-teszt bukik, nincs image.
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm test && npm run build

# Futás: csak a dist és a függőség nélküli szerver.
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=3000 DIST=/app/dist
COPY --from=build /app/dist ./dist
COPY --from=build /app/build/server.js ./server.js
USER node
EXPOSE 3000
CMD ["node", "server.js"]
