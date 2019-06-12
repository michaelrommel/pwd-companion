#include <SPI.h>
#include <MFRC522.h>
#include <HX711.h>
#include "dht.h"
#include "ScaleProtocol.h"
#include "ScaleData.h"
#include "util.h"

#define SCALE_VERSION "0.2.0"

#define MFRC522_RST_PIN 9
#define MFRC522_SS_PIN 10
#define LC_CLK_PIN      2
#define LC_DAT_PIN      3
#define DHT11_PIN      A3

MFRC522 RfidReader(MFRC522_SS_PIN, UINT8_MAX);
HX711 LoadCell;
dht TempSensor;;

// instatiation of serial communication to host computer
ScaleProtocol comHost( Serial, 57600 );
// global variable to store latest command
ScaleCommand command;
// global variable to store current measurement
ScaleMeasurement measurement;
// buffer for the rfid, 14 chars plus terminating null
char rfid[15];
// store the last 5 measurements and build the running average over them
const int weightLength = 5;
float weightMeasures[weightLength];
int weightIndex = 0;

// delay in milliseconds for temperature sensor readings
const unsigned long tempInterval = 3000;
// reporting interval in ms while reading
const unsigned long reportingInterval = 500;
// max number of milliseconds to read out the loadcell before shutting it down
const unsigned long maxTimeOn = 20000;
// after which many seconds to stop reporting after tare or calibration
// if no rfid can be detected
const unsigned long maxReporting  = 60000;
// threshold for card removal
const int removalThreshold = 2;
// flag if the previous rfid detection was true or false
bool previousDetection = false;
// global variable for the calibration factor
float calibrationFactor = 2085.0;
// remember if a rfid chip is present
bool rfidIsPresent = false;
// remember if we should be continuously reporting or waiting for a command
bool isReporting = false;
// flag for stopping the scale and reporting
bool shallBeStopped = false;
// counter for card removal
int removalCounter = 0;
// time when to report next
unsigned long nextReportMillis = 0;
// time to stop, when in tare or calibration mode
unsigned long stopTare = 0;
// time when to stop the loadcell
unsigned long stopCell = 0;
// time for next temperature reading
unsigned long timeForTemp = 0;

void PrintHex(byte *buffer, byte bufferSize) {
  for (byte i = 0; i < bufferSize; i++) {
    Serial.print(buffer[i] < 0x10 ? "0" : "");
    Serial.print(buffer[i], HEX);
  }
}

void clearWeightArray() {
  // initialize the weight array
  for (int i = 0; i < weightLength; i++ ) {
    weightMeasures[i] = -1;
  }
  weightIndex = 0;
}

void setup() {
  comHost.begin();
  // Do nothing if no serial port is opened (added for Arduinos based on ATMEGA32U4)
  while (!Serial);

  Serial.print( F("{\"name\": \"Pinewood Derby Scale\", \"version\": \"") );
  Serial.print( SCALE_VERSION );
  Serial.println( F("\"}") );

  // initialize SPI ports for the card reader
  SPI.begin();
  RfidReader.PCD_Init();
  measurement.rfid = &rfid[0];

  // inititalize the HX711 for the loadcell
  LoadCell.begin(LC_DAT_PIN, LC_CLK_PIN);
  LoadCell.tare(5);
  // set the default value
  LoadCell.set_scale(calibrationFactor);
  // clear the array
  clearWeightArray();
}

void loop() {
  unsigned long now = millis();

  //Serial.println("loop");
  if ( comHost.available() ) {
    // read and process the serial command
    bool res = comHost.receiveCommand( &command );
    if ( res ) {
      // we got a valid command
      switch (command.cmd) {
        case ScaleProtocol::CODE_TARE:
          LoadCell.power_up();
          LoadCell.tare(5);
          //Serial.print("Tare: ");
          //Serial.println(calibrationFactor);
          // remember time to stop the loadcell
          stopCell = now + maxTimeOn;
          // set to start reporting if tare button was pressed
          isReporting = true;
          // set max time to report without an rfid present
          stopTare = now + maxReporting;
          // set time for temperature readings
          timeForTemp = now + tempInterval;
          break;
        case ScaleProtocol::CODE_CALIBRATE:
          //Serial.print("Calibration Weight: ");
          //Serial.println(command.calibrationWeight);
          LoadCell.power_up();
          LoadCell.set_scale();
          calibrationFactor = LoadCell.get_units(10) / command.calibrationWeight;
          LoadCell.set_scale(calibrationFactor);
          //Serial.print("Calibration: ");
          //Serial.println(calibrationFactor);
          // remember time to stop the loadcell
          stopCell = now + maxTimeOn;
          // set to start reporting if calibration had started
          isReporting = true;
          // set max time to report without an rfid present
          stopTare = now + maxReporting;
          // set time for temperature readings
          timeForTemp = now + tempInterval;
          break;
        default:
          break;
      }
    } // else no valid command
  } // else no data available on serial port

  if (rfidIsPresent) {
    //Serial.println("rfidIsPresent");
    // check if an existing rfid has been removed, then stop and
    // power down the loadcell
    if (!RfidReader.PICC_IsNewCardPresent()) {
      //Serial.println("rfid detection false");
      // rfid could not be detected
      if ( !previousDetection ) {
        //Serial.println("incrementing counter");
        // if the previous state also was false, then it was really removed
        // while the same card is read, it alternates
        removalCounter++;
      }
      if (removalCounter > removalThreshold) {
        // stop the reader
        RfidReader.PICC_HaltA();
        RfidReader.PCD_StopCrypto1();
        // reset counters
        rfidIsPresent = false;
        removalCounter = 0;
        // reset continuous reporting
        shallBeStopped = true;
        stopTare = 0;
        // stop loadcell
        stopCell = now - 1;
        //Serial.println("stopping bc rfid removal");
      }
      previousDetection = false;
    } else {
      //Serial.println("rfid detection true");
      previousDetection = true;
    }
  } else {
    //Serial.println("rfidIsNotPresent");
    // if there is a new rfid, then start reporting and remember it
    if (RfidReader.PICC_IsNewCardPresent()) {
      //Serial.println("rfid detection true");
      previousDetection = true;
      // Select one of the cards
      if ( RfidReader.PICC_ReadCardSerial()) {
        if( RfidReader.uid.size > 7 ) {
          // we have only 14 characters available
          Util::printToHex( measurement.rfid, RfidReader.uid.uidByte, 7 );
        } else {
          Util::printToHex( measurement.rfid, RfidReader.uid.uidByte, RfidReader.uid.size );
        }
        LoadCell.power_up();
        isReporting = true;
        rfidIsPresent = true;
        removalCounter = 0;
        shallBeStopped = false;
        stopTare = 0;
        // remember time to stop the loadcell
        stopCell = now + maxTimeOn;
        // set time for temperature readings
        timeForTemp = now + tempInterval;
        //Serial.print("shallbestopped is:");
        //Serial.println(shallBeStopped);
      }
    }
  }

  // check if we should be still report
  if (isReporting) {

    // if we reached the max time for the loadcell, shut it down
    if (stopCell > 0 && now > stopCell) {
      stopCell = 0;
      //LoadCell.power_down();
      //Serial.println("LoadCell powered down!");
    }

    if (stopCell > 0) {
      // loadcell is still running
      // abort if after 500ms the scale is not responding
      if (LoadCell.wait_ready_timeout(500)) {
        // get average over 3 readings
        float newMeasurement = LoadCell.get_units(1);
        // store the measurement into the array
        weightMeasures[weightIndex] = newMeasurement;
        // increment index
        weightIndex++;
        if (weightIndex == weightLength) {
          weightIndex = 0;
        }
      }
      // get the average and build a sensible value for
      // reporting
      measurement.weight = Util::getAverage(weightMeasures, weightLength);
      measurement.stddev = Util::getStdDeviation(weightMeasures, weightLength);
      measurement.calibrationFactor = calibrationFactor;
      // Debugging
      /*
      Serial.print("WArr: ");
      for (int i=0; i<5; i++) {
        Serial.print(weightMeasures[i],5);
        Serial.print(", ");
      }
      Serial.println(measurement.stddev);
      */
    }

    if (timeForTemp > 0 && now > timeForTemp) {
      // check if response is valid
      int checksum = TempSensor.read11(DHT11_PIN);
      switch (checksum) {
        case DHTLIB_OK:
          measurement.temperature = TempSensor.temperature;
          measurement.humidity = TempSensor.humidity;
          break;
        case DHTLIB_ERROR_CHECKSUM:
        case DHTLIB_ERROR_TIMEOUT:
        case DHTLIB_ERROR_CONNECT:
        case DHTLIB_ERROR_ACK_L:
        case DHTLIB_ERROR_ACK_H:
          //measurement.temperature = -1;
          //measurement.humidity = -1;
          break;
        default: 
          //measurement.temperature = -2;
          //measurement.humidity = -2;
          break;
      }
      timeForTemp = now + tempInterval;
    }

    // Check timer for repprting
    if ( nextReportMillis == 0 ) {
      // the first report, set the timer
      nextReportMillis = now + reportingInterval;
      // send the  report
      comHost.sendMeasurement( &measurement );
    } else if (now >= nextReportMillis) {
      // it is time for a new report, reset the timer
      nextReportMillis = now + reportingInterval;
      comHost.sendMeasurement( &measurement );
    }

    // if no card is present and we were reporting,
    // check if we are over the threshold, then stop
    if( stopTare > 0 && now >= stopTare) {
      //Serial.println("Tare stopped");
      shallBeStopped = true;
    }

    // if the rfid was removed, stop reporting
    if (shallBeStopped) {
      //Serial.println("Shall be stopped");
      // reset counters
      isReporting = false;
      shallBeStopped = false;
      nextReportMillis = 0;
      stopTare = 0;
      timeForTemp = 0;

      // reset data structure
      measurement.rfid[0] = '\0';
      measurement.weight = 0;
      measurement.stddev = 0;
      measurement.calibrationFactor = 0;
      measurement.temperature = 0;
      measurement.humidity = 0;
      clearWeightArray();

      // send empty message after some time
      delay(500);
      comHost.sendMeasurement( &measurement );
    }
  }
  // loop delay
  delay(50);
}
