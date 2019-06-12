#ifndef _SCALEDATA_H
#define _SCALEDATA_H

#include <stdint.h>

#define SCALEDATA_VERSION "0.1.0"

typedef struct {
  char* rfid;
  float weight;
  float stddev;
  float calibrationFactor;
  float temperature;
  float humidity;
} ScaleMeasurement;

typedef struct {
  char cmd;
  uint16_t calibrationWeight;
} ScaleCommand;


#endif
// vim:si:sw=2
