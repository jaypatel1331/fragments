# this i a dockerfile for the docker image
# that will be used to build the project
# and run the tests


#step 20- stage 0: install the dependencies
#step20-node version for the docker image with alpine linux(to improve security and reduce size)
FROM node:19.4.0-alpine:3.17.2 as dependencies


#step 20: optimiing the docker file and set the node environment to production
ENV NODE_ENV=production


#maintainer information and description
LABEL maintainer="Jay Patel (japatel31@myseneca.ca)"
LABEL description="Fragments node.js microservice"

# We default to use port 8080 in our service
ENV PORT=8080

# Reduce npm spam when installing within Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn

# Disable colour when run inside Docker
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir (/app)
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
#RUN npm install
#step 20: optimiing the docker file and install node dependencies
RUN npm ci --only=production


USER node


############################################################################################3
#steop 20: stage 1: build the project
FROM node:19.4.0-alpine:3.17.2 as builder

# Use /app as our working directory
WORKDIR /app

#step 20: optimizing the docker file and get the dependencies from the previous stage
COPY --from=dependencies /app /app

# Copy src/
#step 20: optimizing the docker file and copy the src
COPY --chown=node:node ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

#copy source of the project
COPY . .

# Start the container by running our server
#CMD npm start
#step 20: optimiing the docker file and start the container running the server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080
