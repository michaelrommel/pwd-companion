#include "util.h"

#include <stdlib.h>
#include <stdio.h>

namespace Util
{
  constexpr char hexmap[] = {'0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F'};

  void printToHex(char* result, uint8_t* data, int len)
  {
    for (int i=0; i<len; i++) {
      result[2 * i]     = hexmap[(data[i] & 0xF0) >> 4];
      result[2 * i + 1] = hexmap[data[i] & 0x0F];
    }
  }

  float getAverage(float val[], int len) {
    float sum = 0;
    int validCount = 0;
    for (int i = 0; i < len; i++) {
      if (val[i] != -1) {
        // seems a valid measurement
        sum = sum + val[i];
        validCount++;
      }
    }
    if (validCount > 0) {
      return sum / (float)validCount;
    } else {
      return -1;
    }
  }

  float getStdDeviation(float val[], int len) {
    float avg = getAverage(val, len);
    float sumSqares = 0;
    int validCount = 0;
    for (int i = 0; i < len; i++) {
      if (val[i] != -1) {
        // seems a valid measurement
        sumSqares = sumSqares + (val[i] - avg) * (val[i] - avg);
        validCount++;
      }
    }

    if (validCount > 0) {
      float variance = sumSqares / (float)validCount;
      return sqrt(variance);
    } else {
      return -1;
    }
  }

}
