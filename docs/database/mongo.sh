#!/bin/bash

mkdir -p /data/db
touch /var/log/mongodb.log
chmod 777 /var/log/mongodb.log

/entrypoint.sh mongod --logpath /var/log/mongodb.log --logappend &

COUNTER=0
grep -q 'waiting for connections on port' /var/log/mongodb.log
while [[ $? -ne 0 && $COUNTER -lt 60 ]] ; do
    sleep 2
    let COUNTER+=2
    echo "Waiting for mongo to initialize... ($COUNTER seconds so far)"
    grep -q 'waiting for connections on port' /var/log/mongodb.log
done

ls -al /opt/apnic/apnic
mongorestore --drop -d apnic /opt/apnic/apnic

tail -f /var/log/mongodb.log
