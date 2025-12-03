FROM debian:latest

RUN apt update
RUN apt install bind9 -y

# Tạo thư mục zones
RUN mkdir -p /etc/bind/zones

# Copy file cấu hình
COPY named.conf /etc/bind/named.conf
COPY zones/ /etc/bind/zones/

EXPOSE 53/tcp
EXPOSE 53/udp

CMD ["/usr/sbin/named", "-f", "-g"]