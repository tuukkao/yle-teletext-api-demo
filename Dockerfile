FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM node:18-alpine AS build
WORKDIR /app
COPY package.json .
COPY package-lock.json .
COPY --from=deps /app/node_modules ./node_modules
COPY migrations ./migrations
COPY src ./src
COPY knexfile.ts .
COPY tsconfig.json .
RUN npm run build
# Remove dev dependencies to make the image smaller
RUN npm prune --production

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=build /app/build ./build
copy --from=build /app/migrations ./migrations
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/knexfile.ts .
copy --from=build /app/package.json .

CMD ["npm", "start"]
