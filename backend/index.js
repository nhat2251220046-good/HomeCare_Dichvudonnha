const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const http = require("http");
const PORT = 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dbConnect = require("./config/dbConnect");
const { initSocketIO } = require("./config/socketIO");

const server = http.createServer(app);
const userRoutes = require("./routers/userRoutes");
const branchRoutes = require("./routers/branchRoutes");
const serviceRoutes = require("./routers/serviceRoutes");
const customerRoute = require("./routers/customerRoute");
const workAssignmentRoutes = require("./routers/workAssignmentRoutes");
const employeeRoutes = require("./routers/employeeRoute");
const orderRoutes = require("./routers/orderRoutes");
const momoRoutes = require("./routers/momoRoutes");
const chatRoutes = require("./routers/chatRoutes");
const notificationRoutes = require("./routers/notificationRoutes");
dbConnect();

// Initialize Socket.IO
initSocketIO(server);
// Allow localhost origins on any port during development
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., curl, mobile apps, server-to-server)
    if (!origin) return callback(null, true);
    // Allow any localhost origin (http://localhost:5173, http://localhost:5174, etc.)
    const localhostRegex = /^https?:\/\/localhost(:\d+)?$/;
    if (localhostRegex.test(origin)) return callback(null, true);
    // Fallback: deny other origins in dev
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan("dev"));
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", userRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/customers", customerRoute);
app.use("/api/work-assignments", workAssignmentRoutes);
app.use("/api/branches", branchRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/momo", momoRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

server.listen(PORT, () => {
  console.log(`Server is running at PORT ${PORT}`);
});
