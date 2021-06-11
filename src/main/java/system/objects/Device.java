package system.objects;

import java.io.File;
import java.io.IOException;

import static client.Handler.*;

public class Device {

    private final double threshold;

    private int busID;
    private String type;
    private final int[] calibrationData = { 0, 0, 0 };

    private boolean triggered = false;

    public Device(int busID, String type, int threshold) {
        this.busID = busID;
        this.type = type;
        this.threshold = threshold;
    }

    public void checkMovement() {
        triggered = false;
        // Detect device
        updateCalibrationData();
        boolean detected = executeBashScript("/home/pi/project/sensor/detect_device.sh " + busID);
        // read value from device
        if (detected) {
            int[] deviceData = getDeviceReading();
            if (deviceData != null) {
                for (int i = 0; i < 3; i++) {
                    if (Math.abs(deviceData[i] - calibrationData[i]) > threshold) {
                        triggered = true;
                        break;
                    }
                }
                if (triggered) ALARM_SYSTEM.trigger();
            }
        }
    }

    private void updateCalibrationData() {
        // Read calibration data from file into calibrationData array
        File file = new File("/home/pi/project/sensor/sensor_data/" + busID + ".cal");
        if (file.exists()) { // If calibration data exists, load it
            try {
                String data = new String(readAbsoluteFile("/home/pi/project/sensor/sensor_data/" + busID + ".cal"));
                String[] dataParts = data.split("\\|");
                for (int i = 0; i < 3; i++) {
                    String thisData = dataParts[i];
                    calibrationData[i] = Integer.parseInt(thisData.split(":")[1].trim());
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private int[] getDeviceReading() {
        // Read the devices data into file, and load data from file into array to return
        int[] sensor_data = null;
        boolean success = executeBashScript("/home/pi/project/sensor/python_executor.sh " +
                "\"/home/pi/project/sensor/read_device.py " + busID + " " + type + "\"");

        if (success) {
            // Read from file
            try {
                String data = new String(readAbsoluteFile("/home/pi/project/sensor/sensor_data/" + busID + ".data"));
                String[] dataParts = data.split("\\|");
                sensor_data = new int[3];
                for (int i = 0; i < 3; i++) {
                    String thisData = dataParts[i];
                    sensor_data[i] = Integer.parseInt(thisData.split(":")[1].trim());
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return sensor_data;
    }

    public int getBusID() {
        return busID;
    }

    public void setBusID(int busID) {
        this.busID = busID;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }
}
