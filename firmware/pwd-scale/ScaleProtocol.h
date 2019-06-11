#ifndef _SCALEPROTOCOL_H
#define _SCALEPROTOCOL_H

#include "ScaleData.h"
#include <Arduino.h>

#define SCALEPROTOCOL_VERSION "0.1.0"

class ScaleProtocol {

  public:
    explicit ScaleProtocol( HardwareSerial& serial, uint32_t baudRate );
    void begin();
    bool available();
    void sendMeasurement( const ScaleMeasurement* measurement );
    bool receiveCommand( ScaleCommand* cmd );

    // constants to be used also from outside
    // definition of message types
    static const uint8_t CODE_TARE = 't';
    static const uint8_t CODE_CALIBRATE = 'c';

  private:
    HardwareSerial& _hwser;
    uint32_t _baudRate;
};

#endif
// vim:si:sw=2
