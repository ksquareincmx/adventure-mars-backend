require("dotenv").config();
import { setupDB } from "./db";
import { log } from "./libraries/Log";
import { User } from "./models/User";

setupDB()
  .then(() => {
    return createUsers();
  })
  .then(() => {
    log.info("DONE");
    process.exit();
  })
  .catch(err => {
    log.error(err);
  });

const teams = [
  "Rover",
  "Orion",
  "Atlas",
  "Mars",
  "Pluto",
  "Venus",
  "Saturn",
  "Mercury",
  "Isidis",
  "Tharsus"
];
const usersPerTeam = 30;

async function createUsers(): Promise<any> {
  for (let team of teams) {
    let users = [];
    for (let i = 1; i <= usersPerTeam; i++) {
      users.push(team + i);
    }
    for (let username of users) {
      const email = `${username}@scouts.org`;
      try {
        await User.findOrCreate({
          where: { email: email },
          defaults: {
            name: username,
            email: email,
            password: username,
            unitId: 1,
            role: "scout"
          }
        });
      } catch (err) {
        log.error(err);
      }
    }
  }
  return true;
}
