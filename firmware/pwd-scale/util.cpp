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
}
