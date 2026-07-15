require("dotenv").config();
require("./config/database");

const auditWorker = require("./audit.worker");

auditWorker();
