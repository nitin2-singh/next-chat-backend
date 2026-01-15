import "dotenv/config";
import http from "http";
import app from "./app";
import { checkConnections } from "./config/health";
import { setupSocket } from "./config/socket";
import { initKafka, startKafkaConsumer } from "./config/kafka";

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    console.log("DATABASE_URL =", process.env.DATABASE_URL);
    await checkConnections();
    // ✅ create HTTP server
    const server = http.createServer(app);

    // ✅ attach socket.io
    const io = setupSocket(server);
    app.locals.io = io;

    // ✅ start kafka
    await initKafka();
    await startKafkaConsumer(io);

    server.listen(PORT, () => {
      console.log(`🚀 Backend running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("🔥 Server startup failed. Exiting...");
    process.exit(1);
  }
}

startServer();
