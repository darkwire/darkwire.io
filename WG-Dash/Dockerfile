FROM alpine:latest

WORKDIR /home/app 
RUN apk update && \
    apk add --no-cache python3 py3-pip py3-bcrypt py3-pillow uwsgi-python3 && \
    apk add --no-cache build-base linux-headers wireguard-tools openssl nginx && \ 
    apk add --no-cache net-tools iproute2 iptables ip6tables openssl-dev  && \
    apk add --no-cache inotify-tools procps openresolv libc-dev pcre-dev && \
    mkdir /home/app/master-key 
    
COPY ./src /home/app


RUN pip install --upgrade pip --no-cache-dir --break-system-packages  && \   
    python3 -m pip install -r /home/app/requirements.txt --no-cache-dir --break-system-packages && \
    chmod u+x /home/app/entrypoint.sh 

ENTRYPOINT ["/home/app/entrypoint.sh"]



