FROM node:20-alpine

WORKDIR /app

# Copy backend
COPY backend/package*.json ./
RUN npm ci --legacy-peer-deps

COPY backend/src ./src
COPY backend/tsconfig.json .

# Build TypeScript
RUN npm run build

# Install production dependencies only
RUN npm ci --omit=dev --legacy-peer-deps

EXPOSE 3000

CMD ["npm", "start"]
