#!/bin/sh
mkdir -p ./test/assets/XQUTS ./test/assets/QT3TS
curl -L https://github.com/LeoWoerteler/QT3TS/archive/master.tar.gz | tar -xz -C ./test/assets/QT3TS --strip-components=1
curl -L https://github.com/LeoWoerteler/XQUTS/archive/master.tar.gz | tar -xz -C ./test/assets/XQUTS --strip-components=1
unzip -q test/assets/QT3TS/xqueryx.zip -d ./test/assets/QT3TS/
