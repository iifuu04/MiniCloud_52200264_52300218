FROM alpine:latest
RUN apk add --no-cache curl python3 py3-pip

# Tạo user/password mặc định 
ENV MINIO_ROOT_USER="admin123"
ENV MINIO_ROOT_PASSWORD="strongpass123"

RUN curl -LO https://dl.min.io/server/minio/release/linux-amd64/minio \
    && chmod +x minio \
    && mv minio /usr/local/bin/minio


#Install MC
RUN curl -LO https://dl.min.io/client/mc/release/linux-amd64/mc \
    && chmod +x mc \
    && mv mc /usr/local/bin/mc


EXPOSE 9000 9001 
ENTRYPOINT ["minio", "server", "/data", "--console-address", ":9001"]
