#!/bin/sh
curl -L https://github.com/LeoWoerteler/XQUTS/archive/master.tar.gz | tar -xz -C ./test/assets/XQUTS --strip-components=1
unzip -q test/assets/qt3tests/xqueryx.zip -d ./test/assets/qt3tests/
