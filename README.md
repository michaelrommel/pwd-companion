# pwd-companion

A small electron application that offers a simple REST API to bridge the 
gap between the SPA Web Application pwd-racemanager and local resources
of the computer, where the race manager runs.

This allows to attach devices like a RFID reader to a local serial port
and expose the collected information via a REST interface.

## Scripts
```yarn start``` will start the Electron app and the React app at the same time.  
```yarn build``` will build the React app and package it along the Electron app.

## Tipps
To make the React Devtools available run this in the console tab of the
Electron-Devtools: `require('electron-react-devtools').install()`

If you encounter errors while recompiling the serialport module under Windows,
these settings may help:

```
npm config set msbuild_path "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild\Current\Bin\MSBuild.exe"
set npm config set msvs_version 2015 -global
```

Problem: when running electron-builder the native components are mangled.

"postinstall": "electron-builder install-app-deps"

does not help
