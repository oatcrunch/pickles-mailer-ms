FROM node:lts-alpine3.17

# Setting work directory
WORKDIR /usr/app

# Copy required config files
COPY package*.json ./
# COPY tsconfig*.json .

# Install dependencies
RUN npm i

# Copy remaining source codes
COPY . .

# Set default port and expose it
ARG PORT=8081
ENV EMAIL_PORT=${PORT}
EXPOSE ${PORT}

# Transpile from TS to JS
RUN npm run build

# Run from JS bundle
CMD ["npm", "run", "start"]