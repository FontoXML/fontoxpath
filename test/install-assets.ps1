[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest "https://github.com/LeoWoerteler/XQUTS/archive/master.zip" -Out ./test/assets/XQUTS.zip
Expand-Archive ./test/assets/qt3tests/xqueryx.zip -DestinationPath ./test/assets/qt3tests/xqueryx-extracted -Force
Move-Item ./test/assets/qt3tests/xqueryx-extracted/xqueryx ./test/assets/qt3tests/xqueryx
Expand-Archive ./test/assets/XQUTS.zip -DestinationPath ./test/assets/XQUTS-extracted -Force
Move-Item ./test/assets/XQUTS-extracted/XQUTS-master ./test/assets/XQUTS
Remove-Item ./test/assets/XQUTS.zip
Remove-Item ./test/assets/qt3tests/xqueryx-extracted
