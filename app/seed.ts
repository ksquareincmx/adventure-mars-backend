require('dotenv').config();
import { setupDB } from './db';
import { log } from './libraries/Log';
import { User } from './models/User';

setupDB()
  .then(() => {
    return createAdminUser();
  })
  .then(() => {
    log.info('DONE');
    process.exit();
  })
  .catch(err => {
    log.error(err);
  });

async function createAdminUser() {
  await User.create({
    email: 'admin@ksquareinc.com',
    password: 'MartianAdmin01.-',
    role: 'admin'
  });
}
