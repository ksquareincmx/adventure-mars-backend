require("dotenv").config();

import { log } from "./libraries/Log";
import { setupDB } from "./db";
import { setupServer } from "./server";

//import { io, setupSockets } from "./sockets";

import JanitorService from "./services/JanitorService";

import EventService from "./services/EventService";

process.env.TZ = "UTC"; // IMPORTANT For correct timezone management with DB, Tasks etc.

setupDB()
  .then(() => {
    JanitorService.init();
    //EventService.init(); We are not using this currently

    //setupSockets();

    setupServer();
  })
  .catch(err => {
    log.error(err);
  });
