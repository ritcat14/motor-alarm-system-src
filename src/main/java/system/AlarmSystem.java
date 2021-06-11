package system;

import system.objects.Device;
import system.objects.Schedule;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static client.Handler.*;
import static client.Handler.executeBashScript;

public class AlarmSystem implements Runnable {

    private final double SECOND = 1000000000D;
    private final double DESIRED_TPS = 1;
    private final List<Device> deviceList = new ArrayList<>();
    private final List<Schedule> scheduleList = new ArrayList<>();

    private Thread thread;
    private boolean running = false;

    private boolean triggered = false;
    private int triggerTimeout = 120; // Seconds
    private int triggerTimer = 0;
    private String phoneNumber;

    public void trigger() {
        if (!triggered) {
            triggered = true;
            // Trigger
            ALARM_SYSTEM.print(false, "ALARM TRIGGERED!");
            executeBashScript("/home/pi/project/SIM/send_text.sh \"" + phoneNumber + "\" \"ALERT! Vehicle was moved!\"");

        }
    }

    public synchronized void start() {
        running = true;
        thread = new Thread(this);
        thread.start();
    }

    public synchronized void stop() {
        try {
            thread.join();
        } catch (InterruptedException e) {
            e.printStackTrace();
        }

        System.exit(0);
    }

    // Executed every (TPS)/second
    private synchronized void update() {
        if (triggered) {
            triggerTimer++;
            triggered = !(triggerTimer > triggerTimeout);
        } else triggerTimer = 0;

        deviceList.clear();
        scheduleList.clear();

        try {
            byte[] configData = readFileFromWeb("web/database/" + USERNAME + ".conf");
            String[] dataParts = new String(configData).split("\n");

            String[] deviceData = dataParts[1].split(":");
            String[] scheduleData = dataParts[2].split(":");
            String[] phoneData = dataParts[3].split(":");

            phoneNumber = phoneData[1];

            if (deviceData.length > 1) {
                // process devices
                String[] individualData = deviceData[1].split("\\*");
                for (String individualDatum : individualData) {
                    String[] thisDeviceData = individualDatum.split("\\|");
                    int busID = Integer.parseInt(thisDeviceData[0]);
                    String type = thisDeviceData[1];
                    int threshold = Integer.parseInt(thisDeviceData[2]);
                    deviceList.add(new Device(busID, type, threshold));
                }
            }

            if (scheduleData.length > 1) {
                // process schedules
                String data = scheduleData[1];
                if (scheduleData.length > 2)
                    for (int i = 2; i < scheduleData.length; i++)
                        data = data + ":" + scheduleData[i]; // Reconstruct any mis-splits (due to time using ':')

                String[] individualData = data.split("\\*");
                for (String individualDatum : individualData) {
                    String[] thisScheduleData = individualDatum.split("\\|");
                    int ID = Integer.parseInt(thisScheduleData[0]);
                    int busID = Integer.parseInt(thisScheduleData[6]);

                    Device device = getDeviceByBusID(busID);

                    if (device != null) scheduleList.add(new Schedule(ID, thisScheduleData[1], thisScheduleData[2], thisScheduleData[3],
                            thisScheduleData[4], thisScheduleData[5], getDeviceByBusID(busID)));
                }
            }

        } catch (IOException e) {
            e.printStackTrace();
        }

        // Check if any schedules are "active"
        for (Schedule schedule : scheduleList) {
            schedule.update();
        }

    }

    private synchronized Device getDeviceByBusID(int busID) {
        for (Device device : deviceList) {
            if (device.getBusID() == busID) return device;
        }
        print(false, "Device with bus ID " + busID + " was not found!");
        return null;
    }

    @Override
    public void run() {

        long lastTime = System.nanoTime();
        double ns = SECOND / (DESIRED_TPS /2);
        double delta = 0;

        while (running) {
            // Loop

            long now = System.nanoTime();
            delta += (now - lastTime) / ns;
            lastTime = now;

            while (delta >= 1) {
                update();
                delta--;
            }

        }

        stop();
    }

    public synchronized void print(boolean error, String message) {
        if (error) {
            System.err.println("THREAD[" + thread.getName() + " ERROR]:" + message);
            running = false;
        }
        else System.err.println("THREAD[" + thread.getName() + " INFO]:" + message);
    }

}
