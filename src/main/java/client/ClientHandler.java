package client;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.*;

import static client.Handler.*;

public class ClientHandler implements HttpHandler {

    private static String[] config_template = { "user:", "devices:", "schedules:", "phone:" };

    @Override
    public void handle(HttpExchange exchange) throws IOException {
        String method, URI;

        URI = exchange.getRequestURI().toString();
        method = exchange.getRequestMethod();

        try {
            if (!method.equals("GET") && !method.equals("POST")) {

                System.err.println("501 Not Implemented : " + method + " method.");

                byte[] fileData = Handler.readFileFromWeb(METHOD_NOT_SUPPORTED);
                sendResponse(exchange, fileData, "text/html",501);

            }
            else if (method.equals("GET")) { // GET

                if (URI.contains(".html") || URI.contains(".png") || URI.contains(".jpg") || URI.contains(".css") ||
                        URI.contains(".js") || URI.contains(".vlc")) {

                    byte[] fileData = readFileFromWeb(URI);
                    String[] parts = URI.split("[.]");
                    sendResponse(exchange, fileData, parts[parts.length - 1], 200);

                }
                else if (URI.endsWith("data")) {
                    String stateName = URI.split("/")[2];
                    // read all data from file and return it to client
                    byte[] statsData = readFileFromWeb("/web/database/sensorData.txt");
                    statsData = (stateName + ":" + new String(statsData)).getBytes();

                    sendResponse(exchange, statsData, "data", 200);

                }
                else if (URI.contains("fileCheck")) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(exchange.getRequestBody()));
                    StringBuilder payload = new StringBuilder();
                    while (in.ready()) payload.append((char) in.read());

                    System.err.println("New URI:" + URI);
                    String stateName = URI.split("/")[2];
                    System.err.println("Requested State:" + stateName);
                    File file = new File(URI.split(":")[1]);
                    String fileName = URI.split(":")[1].split("/")[6];
                    String result = stateName + ":" + fileName + ":" + (file.exists());
                    sendResponse(exchange, result.getBytes(), "text/html", 200);
                }
                else {
                    byte[] fileData = Handler.readFileFromWeb(METHOD_NOT_SUPPORTED);
                    sendResponse(exchange, fileData, "text/html", 501);
                }

            }
            else { // POST

                if (URI.contains("login")) { // we are processing login request
                    BufferedReader in = new BufferedReader(new InputStreamReader(exchange.getRequestBody()));
                    StringBuilder payload = new StringBuilder();
                    while (in.ready()) payload.append((char) in.read());

                    String[] payloadParts = payload.toString().split("[;]");

                    String[] userParts = payloadParts[0].split("[=]");
                    String[] passParts = payloadParts[1].split("[=]");

                    int loginCode = getLoginCode(userParts[1], passParts[1]);

                    if (loginCode == LOGIN_SUCCESS) {

                        // Create user configuration file
                        if (!createFile("web/database/" + USERNAME + ".conf")) System.err.println("User config already exists, aborting create!");
                        else {
                            config_template[0] = "user:" + USERNAME;
                            writeToWebFile("web/database/" + USERNAME + ".conf", config_template);
                        }
                    }

                    sendResponse(exchange, verifyLogin(loginCode), "authentication", 200);

                }
                else if (URI.contains("script")) {
                    System.out.println("Executing script");
                    BufferedReader in = new BufferedReader(new InputStreamReader(exchange.getRequestBody()));
                    StringBuilder payload = new StringBuilder();
                    while (in.ready()) payload.append((char) in.read());

                    String stateName = URI.split("/")[2];

                    String scriptFile = payload.toString();

                    System.out.println("    Script execution request:" + scriptFile);

                    String response = stateName + (":script-value:" + scriptFile + ":" + executeBashScript(scriptFile));

                    sendResponse(exchange, response.getBytes(), "text/html", 200);

                }
                else if (URI.contains("update-password")) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(exchange.getRequestBody()));
                    StringBuilder payload = new StringBuilder();
                    while (in.ready()) payload.append((char) in.read());

                    String stateName = URI.split("/")[2];

                    String[] passes = payload.toString().split("[;]");

                    String currPass = passes[0];
                    String newPass = passes[1];

                    int success = updatePassword(currPass, newPass);
                    String result = "";
                    if (success == LOGIN_SUCCESS) result = "Password successfully changed!";
                    else if (success == PASSWORD_WRONG) result = "Current password is incorrect!";
                    else result = "Password could not be updated. Please consult tech support!";

                    String response = stateName + (":password-changed:" + result);

                    sendResponse(exchange, response.getBytes(), "text/html", 200);

                }
                else if (URI.contains("update-config")) {
                    BufferedReader in = new BufferedReader(new InputStreamReader(exchange.getRequestBody()));
                    StringBuilder payload = new StringBuilder();
                    while (in.ready()) payload.append((char) in.read());

                    String data = payload.toString();

                    writeToWebFile("web/database/" + USERNAME + ".conf", data.split(";"));

                    byte[] fileData = readFileFromWeb("web/database/" + USERNAME + ".conf");
                    String fileStringData = new String(fileData);

                    sendResponse(exchange, ("admin:updated-config:" + fileStringData).getBytes(), "text/html", 200);
                }
                else {
                    byte[] fileData = Handler.readFileFromWeb(METHOD_NOT_SUPPORTED);
                    sendResponse(exchange, fileData, "text/html", 501);
                }
            }
        } catch (FileNotFoundException e) {
            try {
                fileNotFound(exchange);
            } catch (IOException ioe) {
                System.err.println("Error with file not found exception : " + ioe.getMessage());
            }
        }
    }

    public void sendResponse(HttpExchange exchange, byte[] data, String type, int code) throws IOException {
        exchange.sendResponseHeaders(code, data.length);

        OutputStream outputStream = exchange.getResponseBody();
        outputStream.write(data);
        outputStream.close();

        System.out.println("    Data of type " + type + " returned.");
    }

    private void fileNotFound(HttpExchange exchange) throws IOException {
        byte[] fileData = Handler.readFileFromWeb(FILE_NOT_FOUND);
        sendResponse(exchange, fileData, "text/html",404);
    }
}
