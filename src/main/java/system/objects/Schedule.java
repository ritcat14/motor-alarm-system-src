package system.objects;

import java.text.SimpleDateFormat;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import static client.Handler.ALARM_SYSTEM;

public class Schedule {

    private final ZoneId zoneIDUK = ZoneId.of("Europe/London");
    private final int ID;
    private String startTime, endTime, startDate, endDate, state;
    private Device device;
    private boolean removed = false;

    private ZonedDateTime startZonedDate, endZonedDate, currentDate;

    public Schedule(int ID, String startTime, String endTime, String startDate, String endDate, String state, Device device) {
        this.ID = ID;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.state = state;
        this.device = device;
        startZonedDate = getDate(startDate, startTime);
        endZonedDate = getDate(endDate, endTime);
    }

    public void update() {
        if (removed) return; // Dont update if this schedule is inactive
        if (state.equals("on")) {
            // get current time
            currentDate = ZonedDateTime.now(zoneIDUK);

            if (startZonedDate.isBefore(currentDate) && endZonedDate.isAfter(currentDate)) { // (in-between start and end)
                device.checkMovement();
            } else if (startZonedDate.isAfter(currentDate)) { // Haven't yet reached start time
                ;
            } else if (endZonedDate.isBefore(currentDate)) { // This schedule is out of date!
                removed = true;
            }
        }
    }

    private ZonedDateTime getDate(String date, String time) {
        int yyyy, mm, dd, hr, m;

        String[] dateParts = date.split("-");
        String[] timeParts = time.split(":");

        yyyy = Integer.parseInt(dateParts[0]);
        mm = Integer.parseInt(dateParts[1]);
        dd = Integer.parseInt(dateParts[2]);

        hr = Integer.parseInt(timeParts[0]);
        m = Integer.parseInt(timeParts[1]);

        return ZonedDateTime.of(yyyy, mm, dd, hr, m, 0, 0, zoneIDUK);
    }

    public int getID() {
        return ID;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
        startZonedDate = getDate(startDate, startTime);
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
        endZonedDate = getDate(endDate, endTime);
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
        startZonedDate = getDate(startDate, startTime);
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
        endZonedDate = getDate(endDate, endTime);
    }

    public String getState() {
        return state;
    }

    public void setState(String state) {
        this.state = state;
    }

    public Device getDevice() {
        return device;
    }

    public void setDevice(Device device) {
        this.device = device;
    }

    public boolean isRemoved() {
        return removed;
    }
}
