[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
Invoke-WebRequest "https://github.com/LeoWoerteler/QT3TS/archive/master.zip" -Out ./test/assets/QT3TS.zip
Invoke-WebRequest "https://github.com/LeoWoerteler/XQUTS/archive/master.zip" -Out ./test/assets/XQUTS.zip
Expand-Archive ./test/assets/QT3TS.zip -DestinationPath ./test/assets/QT3TS-extracted -Force
Move-Item ./test/assets/QT3TS-extracted/QT3TS-master ./test/assets/QT3TS
Expand-Archive ./test/assets/QT3TS/xqueryx.zip -DestinationPath ./test/assets/QT3TS/xqueryx-extracted -Force
Move-Item ./test/assets/QT3TS/xqueryx-extracted/xqueryx ./test/assets/QT3TS/xqueryx
Expand-Archive ./test/assets/XQUTS.zip -DestinationPath ./test/assets/XQUTS-extracted -Force
Move-Item ./test/assets/XQUTS-extracted/XQUTS-master ./test/assets/XQUTS
Remove-Item ./test/assets/QT3TS.zip
Remove-Item ./test/assets/XQUTS.zip
Remove-Item ./test/assets/QT3TS-extracted
Remove-Item ./test/assets/QT3TS/xqueryx-extracted
Remove-Item ./test/assets/XQUTS-extracted
