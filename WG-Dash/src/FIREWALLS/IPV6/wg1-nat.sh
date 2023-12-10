#!/bin/bash
WIREGUARD_INTERFACE=IPV6MEMBERS
WIREGUARD_LAN=192.168.40.1/24
WIREGUARD_LAN_IPV6=2001:db8:40:1::/64
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

# Drop incoming traffic from wg1 to wg-dashboard
iptables -A INPUT -i $WIREGUARD_INTERFACE -j DROP
ip6tables -A INPUT -i $WIREGUARD_INTERFACE -j DROP

# Accept DNS from Adguard
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.100 -p udp --dport 53 -j ACCEPT
# Accept Channels FEC
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.4 -p tcp --dport 80 -j ACCEPT
# Drop Direct Forward traffic to Dockge
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.2 -j DROP
# Drop Forward traffic to AdGuard Dashboard
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.100 -j DROP
# Drop Forward traffic to Unbound (members should be restricted form accesing the means of modifying the network)
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.200 -j DROP
# Drop Forward traffic to Channels Database
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.5 -j DROP
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 10.2.0.4 -j DROP

# Accept outgoing connections to HTTP(S) ports to any IP address (public because of rule above)
iptables -A $CHAIN_NAME -s $WIREGUARD_LAN -i $WIREGUARD_INTERFACE -d 0.0.0.0/0 -p tcp -m multiport --dports 20,21,22,80,443,3389 -j ACCEPT
# Accept outgoing connections to HTTP(S) ports to any IP address (public because of rule above)
ip6tables -A $CHAIN_NAME -s $WIREGUARD_LAN_IPV6 -i $WIREGUARD_INTERFACE -d ::/0 -p tcp -m multiport --dports 20,21,22,80,443,3389 -j ACCEPT

# Drop everything else coming through the Wireguard interface
iptables -A $CHAIN_NAME -i $WIREGUARD_INTERFACE -j DROP
ip6tables -A $CHAIN_NAME -i $WIREGUARD_INTERFACE -j DROP

# Return to FORWARD chain
iptables -A $CHAIN_NAME -j RETURN
ip6tables -A $CHAIN_NAME -j RETURN
