# Use an official Node runtime as a parent image
FROM node:14-slim as build

# Set the working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the application's code
COPY . ./

# Build the app
RUN npm run build

# Use Nginx to serve the app
FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html

# Remove the default Nginx configuration file
RUN rm /etc/nginx/conf.d/default.conf

# Copy the custom Nginx configuration template
COPY default.conf.template /etc/nginx/templates/default.conf.template

# Expose port 8080 (Cloud Run will set the PORT environment variable to 8080)
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
