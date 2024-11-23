#!/bin/sh


generate_self_signed_ssl() {
    local key_file="certs/selfsigned.key"
    local cert_file="certs/selfsigned.crt"
    local csr_file="certs/selfsigned.csr"
    local config_file="certs/openssl.cnf"
    local days_valid=365

    mkdir -p certs

    cat > "$config_file" <<EOF
[req]
default_bits = 2048
prompt = no
default_md = sha256
distinguished_name = dn
req_extensions = req_ext
x509_extensions = v3_ca

[dn]
C = US
ST = FL
L = Miami
O = NoxCorp
OU = GhostWorks
CN = Noxcis

[req_ext]
subjectAltName = @alt_names

[alt_names]
IP.1 = 127.0.0.1

[v3_ca]
basicConstraints = critical, CA:TRUE, pathlen:0
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = serverAuth
EOF

    openssl genpkey -algorithm RSA -out "$key_file"
    openssl req -new -key "$key_file" -out "$csr_file" -config "$config_file"
    openssl x509 -req -days "$days_valid" -in "$csr_file" -signkey "$key_file" \
        -out "$cert_file" -extfile "$config_file" -extensions req_ext -extensions v3_ca
}

#!/bin/bash

# Function to allow only private IP ranges for incoming connections
allow_private_ips_only() {
    # Flush existing iptables rules
    iptables -F
    iptables -X

    # Allow loopback traffic
    iptables -A INPUT -i lo -j ACCEPT
    iptables -A OUTPUT -o lo -j ACCEPT

    # Allow established and related connections
    iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT

    # Allow traffic from private IP ranges
    iptables -A INPUT -s 10.0.0.0/8 -j ACCEPT
    iptables -A INPUT -s 172.16.0.0/12 -j ACCEPT
    iptables -A INPUT -s 192.168.0.0/16 -j ACCEPT

    # Drop all other traffic
    iptables -A INPUT -j DROP

    # Allow outgoing traffic to private IP ranges
    iptables -A OUTPUT -d 10.0.0.0/8 -j ACCEPT
    iptables -A OUTPUT -d 172.16.0.0/12 -j ACCEPT
    iptables -A OUTPUT -d 192.168.0.0/16 -j ACCEPT

    # Drop all other outgoing traffic
    iptables -A OUTPUT -j DROP
}



# Graceful shutdown function
shutdown_nginx() {
    echo "Shutting down Nginx..."
    nginx -s quit
    exit 0
}

# Trap SIGTERM signal and call shutdown_nginx
trap 'shutdown_nginx' SIGTERM


        generate_self_signed_ssl  >> /dev/null 2>&1 
        echo '
██████╗  █████╗ ██████╗ ██╗  ██╗██╗    ██╗██╗██████╗ ███████╗
██╔══██╗██╔══██╗██╔══██╗██║ ██╔╝██║    ██║██║██╔══██╗██╔════╝
██║  ██║███████║██████╔╝█████╔╝ ██║ █╗ ██║██║██████╔╝█████╗  
██║  ██║██╔══██║██╔══██╗██╔═██╗ ██║███╗██║██║██╔══██╗██╔══╝  
██████╔╝██║  ██║██║  ██║██║  ██╗╚███╔███╔╝██║██║  ██║███████╗
╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚═╝  ╚═╝╚══════╝
Dockerized by NOXCIS                                                             
'
        # Start the server
        allow_private_ips_only
        yarn start &
        nginx &
        # Wait indefinitely to handle SIGTERM
        wait

