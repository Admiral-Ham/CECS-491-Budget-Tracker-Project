#FROM ubuntu:latest
#LABEL authors="orion"

#ENTRYPOINT ["top", "-b"]

services: #list of container

    mongodb:
        image: "mongodb"

        ports:
            - "3000:3000"

        volumes:
            -

        environment:

    backend:

    frontend:

    