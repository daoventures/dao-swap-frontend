FROM node:12 as build

WORKDIR /dao-swap-frontend
COPY . /dao-swap-frontend

RUN yarn
RUN yarn build

#CMD ["npm", "start"]

FROM nginx:alpine

COPY --from=build /dao-swap-frontend/build /usr/share/nginx/html

# RUN rm /etc/nginx/conf.d/default.conf
# COPY nginx/default.conf /etc/nginx/conf.d

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
