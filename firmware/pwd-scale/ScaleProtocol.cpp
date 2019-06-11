#include "ScaleProtocol.h"
#include "ScaleData.h"

#include <Arduino.h>
#include <ArduinoJson.h>

#include <string.h>

// class constructor
ScaleProtocol::ScaleProtocol( HardwareSerial& serial, uint32_t baudRate ) :
  _hwser( serial )
{
  _baudRate = baudRate;
}

// initialise the port
void ScaleProtocol::begin()
{
  _hwser.begin( _baudRate );
  // should return immediately except for the Leonardo
  while ( ! _hwser );
  // the max time we wait for incoming data in millis
  _hwser.setTimeout( 800 );
}

// checks for availablity of data on the serial line
bool ScaleProtocol::available() {
  return _hwser.available();
}

// send the car detection for a heat, that has been set up (argument if the lane was wrong)
void ScaleProtocol::sendMeasurement( const ScaleMeasurement* measurement )
{
  const uint16_t capacity = JSON_OBJECT_SIZE(4) + 250;
  StaticJsonBuffer<capacity> jsonBuffer;

  //SerialUSB.print( F("JSON Size: ") );
  //SerialUSB.println( capacity );
  JsonObject& root = jsonBuffer.createObject();
  root["rfid"] = measurement->rfid;
  root["wght"] = measurement->weight;
  root["temp"] = measurement->temperature;
  root["hum"] = measurement->humidity;
  root.printTo( _hwser );
  _hwser.println();
}

// this gets called after the main loop checked that there
// are bytes available on this serial comm
bool ScaleProtocol::receiveCommand( ScaleCommand* cmd )
{
  const uint16_t len = 384;
  char incomingBytes[len+1];
  uint16_t countRead;
  uint16_t calibrationWeight;

  const uint16_t capacity = JSON_OBJECT_SIZE(4) + 320;
  StaticJsonBuffer<capacity> jsonBuffer;

  countRead = _hwser.readBytesUntil('\n', incomingBytes, len);

  if( countRead == 0 ) {
    // error, we did not find any usable data
    //_hwser.println("error!");
    return false;
  } else {
    incomingBytes[countRead] = '\0';

    //_hwser.print("got bytes: ");
    //_hwser.println( countRead );
    // debug startgate
    //_hwser.print("Received: ");
    //_hwser.println( incomingBytes );

    // decode data
    JsonObject& root = jsonBuffer.parse(incomingBytes);
    if( root.success() ) {
      // check valid commands
      const char* codePtr = root["c"];
      const char code = codePtr[0];
      //_hwser.print("Code was: ");
      //_hwser.println( code );
      // process command 
      switch( code ) {
        case (uint8_t) CODE_TARE:
          cmd->cmd = code;
          cmd->calibrationWeight = 0;
          return true;
          break;
        case (uint8_t) CODE_CALIBRATE:
          cmd->cmd = code;
          cmd->calibrationWeight = root["w"];;
          return true;
          break;
        default:
          return false;
          break;
      }
    } else {
      //_hwser.println("error decoding json");
      return false;
    }
  }
}

// vim:ci:si:sw=2
