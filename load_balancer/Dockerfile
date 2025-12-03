FROM nginx:stable

RUN apt-get update && \
    apt-get install -y iputils-ping dnsutils curl && \
    rm -rf /var/lib/apt/lists/*

COPY nginx.conf /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
