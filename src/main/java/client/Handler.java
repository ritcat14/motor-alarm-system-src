package client;

import system.AlarmSystem;

import javax.script.*;
import java.io.*;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThat;

public abstract class Handler {

    // DATA GLOBALS

    private static final Map<String, String> users = new HashMap<>();

    // PYTHON STUFF

    private static final StringWriter scriptWriter = new StringWriter();
    private static final ScriptContext scriptContext = new SimpleScriptContext();
    private static final ScriptEngineManager engineManager = new ScriptEngineManager();
    private static final ScriptEngine scriptEngine = engineManager.getEngineByName("python");

    // LOGIN GLOBALS

    public static final int USERNAME_WRONG = 0;
    public static final int PASSWORD_WRONG = 1;
    public static final int USER_NOT_EXIST = 2;
    public static final int LOGIN_SUCCESS = 3;

    // FILE GLOBALS

    public static final File WEB_ROOT = new File(".");
    public static final String METHOD_NOT_SUPPORTED = "not_supported.html";
    public static final String FILE_NOT_FOUND = "web/404.html";
    public static final String USERNAME = "admin";

    // FILE PRIVATES
    private static final List<String> mainScriptData = new ArrayList<>();

    // System
    public static final AlarmSystem ALARM_SYSTEM = new AlarmSystem();

    /*
            INIT
     */

    /*
            Reads users that exists from file into a hash map of users and passwords.
     */
    public static synchronized void init() throws IOException {
        synchronized (users) {
            String userFile = new String(readFileFromWeb("/web/database/users.txt"));
            String[] fileLines = userFile.split("[\n]");
            for (String data : fileLines) {
                String[] dataParts = data.split("[:]");
                users.put(dataParts[0].replaceAll("(\\r\\n|\\n|\\r)", ""),dataParts[1].replaceAll("(\\r\\n|\\n|\\r)", ""));
            }
        }
        scriptContext.setWriter(scriptWriter);

        createMainScript();
    }

    private static synchronized void createMainScript() throws IOException {
        synchronized (WEB_ROOT) {
            mainScriptData.clear();
            readJavascriptFilesToList(new File(WEB_ROOT, "web/js/"));
            mainScriptData.add(new String(readFileFromWeb("web/js/main.js"))); // Add main script at bottom of new file

            // Add State.js to beginning of script
            List<String> tempList = new ArrayList<>();
            tempList.add(new String(readFileFromWeb("web/js/states/State.js")));
            tempList.addAll(mainScriptData);
            mainScriptData.clear();
            mainScriptData.addAll(tempList);

            File scriptFile = new File(WEB_ROOT, "web/js/mainScript.js");
            boolean deleteResult = Files.deleteIfExists(scriptFile.toPath()); // Delete file if it exists

            System.out.println("Main script file deleted:" + deleteResult);

            boolean created = createFile("web/js/mainScript.js");
            if (created) System.out.println("File mainScript.js created as it did not exist!");

            String[] allFileData = new String[mainScriptData.size()];
            for (int i = 0; i < mainScriptData.size(); i++) allFileData[i] = mainScriptData.get(i);

            writeToWebFile("web/js/mainScript.js", allFileData);
        }
    }

    private static synchronized void readJavascriptFilesToList(File dir) throws IOException {
        synchronized (WEB_ROOT) {
            File[] files = dir.listFiles();
            for (File file : files) {
                if (file.isDirectory()) {
                    readJavascriptFilesToList(file);
                } else {
                    String filePath = file.getCanonicalPath();
                    // Skip adding main script (added at END) and mainScript (if file is already generated)
                    // Also skip State.js as needs to be loaded BEFORE anything else!
                    if (filePath.contains("main.js") || filePath.contains("mainScript.js") ||
                            filePath.contains("State.js")) continue;
                    byte[] data = readFileData(file, (int) file.length());
                    String stringData = new String(data);
                    mainScriptData.add(stringData);
                }
            }
        }
    }

    public static synchronized void updateDatabase() throws IOException {
        synchronized (users) {
            String[] newFile = new String[users.entrySet().size()];
            int index = 0;
            for (Map.Entry<String, String> entry : users.entrySet())
                newFile[index++] = entry.getKey() + ":" + entry.getValue();
            writeToWebFile("web/database/users.txt", newFile);
        }
    }

    /*
            FILE PROCESSING
     */

    public static synchronized byte[] readAbsoluteFile(String path) throws IOException {
        File file = new File(path);
        int length = (int)file.length();
        return readFileData(file, length);
    }

    public static synchronized byte[] readFileFromWeb(String path) throws IOException {
        synchronized (WEB_ROOT) {
            File file = new File(WEB_ROOT, path);
            int length = (int)file.length();
            return readFileData(file, length);
        }
    }

    private static synchronized byte[] readFileData(File file, int length) throws IOException {
        FileInputStream fileInputStream = null;
        byte[] fileData = new byte[length];

        try {
            fileInputStream = new FileInputStream(file);
            fileInputStream.read(fileData);
        } finally {
            if (fileInputStream != null) fileInputStream.close();
        }

        return fileData;
    }

    public static synchronized boolean createFile(String file) throws IOException {
        synchronized (WEB_ROOT) {
            File file1 = new File(WEB_ROOT, file);
            return (file1.createNewFile());
        }
    }

    public static synchronized void writeToWebFile(String file, String[] data) throws IOException {
        synchronized (WEB_ROOT) {
            File file1 = new File(WEB_ROOT, file);

            StringBuilder output = new StringBuilder("");

            for (int i = 0; i < data.length; i++) {
                output.append(data[i].trim().replaceAll("\n", "")).append("\n");
            }

            String finalOutput = output.toString();
            if (finalOutput.endsWith("*")) finalOutput = finalOutput.substring(1, finalOutput.length() - 1);

            FileOutputStream oFile = new FileOutputStream(file1, false);

            PrintWriter printWriter = new PrintWriter(oFile);

            printWriter.write(finalOutput);

            printWriter.close();
            oFile.close();
        }
    }

    /*
            BASH
     */

    public static boolean executeBashScript(String scriptFile) {
        try {
            ProcessBuilder processBuilder = new ProcessBuilder("/bin/bash", "-c", scriptFile);
            Process process = processBuilder.start();
            process.waitFor();
            return process.exitValue() == 0;
        } catch (IOException | InterruptedException e) {
            e.printStackTrace();
            System.err.println("ERROR: Failed to execute bash script " + scriptFile + "!");
            System.exit(-1);
        }
        return false;
    }

    /*
            LOGIN PROCESSING
     */

    public static byte[] verifyLogin(int loginCode) throws IOException {
        String result = "";

        if (loginCode == LOGIN_SUCCESS) {
            // generate mainScript.js prior to reading, to load any script updates
            createMainScript();

            String fileData = new String(readFileFromWeb("web/mainPage.html"));
            String scriptData = new String(readFileFromWeb("web/js/mainScript.js"));
            String configData = new String(readFileFromWeb("web/database/" + USERNAME + ".conf"));
            result = "Y@" + fileData + "@" + scriptData + "@" + configData;
        }
        else result = "N@" + loginCode + "@";

        return result.getBytes();
    }

    public static synchronized int getLoginCode(String username, String password) {
        synchronized (users) {
            if (username.equals("") || username.equals(" ")) return USERNAME_WRONG;
            if (password.equals("") || password.equals(" ")) return PASSWORD_WRONG;

            // Determine if user exists
            for (Map.Entry<String, String> entry : users.entrySet()) {
                if (entry.getKey().equals(username)) {
                    if (entry.getValue().equals(password)) return LOGIN_SUCCESS;
                    else return PASSWORD_WRONG;
                }
            }
            return USER_NOT_EXIST;
        }
    }

    public static synchronized int updatePassword(String currPass, String newPass) throws IOException {
        synchronized (users) {
            int loginCode = getLoginCode(USERNAME, currPass); // For verifying password entered is correct
            if (loginCode == LOGIN_SUCCESS) {
                // Update password in database to new password
                for (Map.Entry<String, String> entry : users.entrySet()) {
                    if (entry.getKey().equals(USERNAME)) entry.setValue(newPass);
                }
                updateDatabase();
            }
            return loginCode;
        }
    }

}
