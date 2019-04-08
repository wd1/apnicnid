FROM	mongo
COPY	./ /opt/apnic
WORKDIR	/opt/apnic
RUN	tar xvfz apnic.tar.gz
CMD	/opt/apnic/mongo.sh
EXPOSE	27017
