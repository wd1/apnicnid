FROM	debian:jessie-backports
RUN	apt-get update -y
RUN	apt-get install -y --no-install-recommends apt-utils
RUN	apt-get install build-essential chrpath libssl-dev libxft-dev -y
RUN	apt-get install libfreetype6 libfreetype6-dev -y
RUN	apt-get install libfontconfig1 libfontconfig1-dev -y
RUN	apt-get install curl -y
RUN	curl -sL https://deb.nodesource.com/setup_7.x | bash -
RUN	apt-get install -y nodejs
RUN	mkdir /opt/apnic
WORKDIR	/opt/apnic
COPY	. /opt/apnic
RUN	npm install -d
RUN	npm run build
RUN	apt-get install nginx -y
WORKDIR	/var/www/html
RUN	rm *
RUN	mv -v /opt/apnic/dist/production/* .
CMD	["nginx", "-g", "daemon off;"]
EXPOSE	80
