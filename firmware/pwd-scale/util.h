#include <Arduino.h>

namespace Util
{
  void printToHex(char* result, uint8_t* data, int len);
  float getAverage(float val[], int len);
  float getStdDeviation(float val[], int len);
}
