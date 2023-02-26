# Build frontend
FROM node as frontend-build
WORKDIR /frontend
COPY frontend/package*.json ./
RUN npm install
# Next, we copy only the contents of frontend folder
COPY frontend/ ./
RUN npm run build

# Build backend
FROM node as backend-build
WORKDIR /backend
# Next we copy only the contents of backend folder
COPY backend/ ./
# RUN npm run build

# Final image
FROM node
WORKDIR /app
COPY --from=frontend-build frontend/ ./frontend
COPY --from=backend-build backend/ ./backend
COPY package*.json ./
RUN npm install --production
EXPOSE 8000
CMD ["npm", "run", "start-app"]

