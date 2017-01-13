FROM nginx:latest
MAINTAINER Erik van der Valk <erik.van.der.valk@liones.nl>

COPY dist /usr/share/nginx/html
