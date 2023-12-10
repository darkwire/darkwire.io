#!/bin/bash
WIREGUARD_INTERFACE=IPV6ADMINS
WIREGUARD_LAN=192.168.30.1/24
WIREGUARD_LAN_IPV6=2001:db8:30:1::/64
MASQUERADE_INTERFACE=eth0


iptables -t nat -I POSTROUTING -o $MASQUERADE_INTERFACE -j MASQUERADE -s $WIREGUARD_LAN
ip6tables -t nat -I POSTROUTING -o $MASQUERADE_INTERFACE -j MASQUERADE -s $WIREGUARD_LAN_IPV6

# Add a WIREGUARD_wg0 chain to the FORWARD chain
CHAIN_NAME="WIREGUARD_$WIREGUARD_INTERFACE"
iptables -N $CHAIN_NAME
iptables -A FORWARD -j $CHAIN_NAME
ip6tables -N $CHAIN_NAME
ip6tables -A FORWARD -j $CHAIN_NAME

# Accept related or established traffic
iptables -A $CHAIN_NAME -o $WIREGUARD_INTERFACE -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
ip6tables -A $CHAIN_NAME -o $WIREGUARD_INTERFACE -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT

# Accept traffic from any Wireguard IP address connected to the Wireguard server
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -j ACCEPT
ip6tables -A $CHAIN_NAME -s $WIREGUARD_LAN_IPV6 -i $WIREGUARD_INTERFACE -j ACCEPT

# Allow traffic to the local loopback interface
iptables -A $CHAIN_NAME -o lo -j ACCEPT
# Allow traffic to the local loopback interface
ip6tables -A $CHAIN_NAME -o lo -j ACCEPT

# Drop everything else coming through the Wireguard interface
iptables -A $CHAIN_NAME -i $WIREGUARD_INTERFACE -j DROP
ip6tables -A $CHAIN_NAME -i $WIREGUARD_INTERFACE -j DROP

# Return to FORWARD chain
iptables -A $CHAIN_NAME -j RETURN
ip6tables -A $CHAIN_NAME -j RETURN