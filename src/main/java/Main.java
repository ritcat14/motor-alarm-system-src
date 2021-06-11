import client.ClientHandler;
import client.Handler;
import com.sun.net.httpserver.HttpServer;

import java.net.InetSocketAddress;
import java.util.concurrent.Executors;

import static client.Handler.ALARM_SYSTEM;

public class Main {

    private static final int PORT = 8500;
    private static final int CLIENT_NUM = 10;

    public static void main(String[] args) throws Exception {
        ALARM_SYSTEM.start();

        Handler.init();

        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);
        System.out.println("Started server on port " + PORT + "...\n");

        server.createContext("/", new ClientHandler());

        server.setExecutor(Executors.newFixedThreadPool(CLIENT_NUM));
        server.start();
    }

}
