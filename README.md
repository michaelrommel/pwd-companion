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
To make the React Devtools available run this in the console tab of the Electron-Devtools: `require('electron-react-devtools').install()`
