# Use an official Node.js runtime as a parent image
FROM node:20.10.0-alpine AS build

# Set the working directory in the container
WORKDIR /src

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use a lightweight web server to serve the React app
FROM nginx:1.25-alpine

# Copy the build output to Nginx's html directory
COPY --from=build /src/build /usr/share/nginx/html

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx when the container launches
CMD ["nginx", "-g", "daemon off;"]
