DNS server sử dụng Bind9 để cung cấp DNS resolution cho các domain nội bộ trong hệ thống MiniCloud.
- **DNS Server**: Bind9 (BIND)
- **Base Image**: Debian
- **Configuration**: named.conf
- **Zone Files**: Custom DNS zones

### Basic Settings
- **Port**: Host 53 → Container 53 (UDP/TCP) (docker-compose map `53:53/udp`, `53:53/tcp`)
- **Configuration**: /etc/bind/named.conf
- **Zone Directory**: /etc/bind/zones/
- **User**: bind:bind

```
dns-server/
├── Dockerfile              # Docker configuration
├── named.conf              # Main Bind9 configuration
├── zones/                  # DNS zone files
│   ├── db.localhost       # localhost zone
│   └── db.cloud.local     # cloud.local zone
└── README.md              # This file
```

## Docker Configuration

```yaml
dns-server:
  build:
    context: ./dns-server
    dockerfile: Dockerfile
  image: 52200292/dns-server:latest
  ports:
    - "53:53/udp"   # Host port 53 -> container 53 UDP
    - "53:53/tcp"   # Host port 53 -> container 53 TCP
  networks:
    - cloud-net
  volumes:
    - ./dns-server/zones:/etc/bind/zones
    - ./dns-server/named.conf:/etc/bind/named.conf
  restart: unless-stopped
```

## Docker Commands

