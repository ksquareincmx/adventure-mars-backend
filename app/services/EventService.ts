/*
  EventService
    Manages events.
 */

import { log } from "./../libraries/Log";
import { EventEmitter } from "events";
import { db } from "./../db";

class EventService extends EventEmitter {
  constructor() {
    super();
  }

  init() {
    // Setup model change events
    db.addHook("afterUpdate", (instance: any, options: any) => {
      let changed = instance._changed;
      let changes = {};

      for (let k in changed) {
        if (changed.hasOwnProperty(k)) {
          changes[k] = instance[k];
        }
      }

      if (instance.userId) {
        this.emit(`db/update/${instance.userId}`, {
          model: instance.$modelOptions.name.singular,
          id: instance.id,
          changed: changes
        });
        this.emit(`db/change/${instance.userId}`, {
          event: "update",
          model: instance.$modelOptions.name.singular,
          id: instance.id,
          changed: changes
        });
      }
    });

    // db.addHook('afterBulkUpdate', (instance: any, options: any) => {
    //   // Called multiple times...
    //   console.log('DB event BulkUpd:', instance);
    // });

    db.addHook("afterDestroy", (instance: any, options: any) => {
      if (instance.userId) {
        this.emit(`db/destroy/${instance.userId}`, {
          model: instance.$modelOptions.name.singular,
          id: instance.id
        });
        this.emit(`db/change/${instance.userId}`, {
          event: "destroy",
          model: instance.$modelOptions.name.singular,
          id: instance.id
        });
      }
    });

    db.addHook("afterCreate", (instance: any, options: any) => {
      console.log(instance);
      if (instance.userId) {
        this.emit(`db/create/${instance.userId}`, {
          model: instance.$modelOptions.name.singular,
          id: instance.id
        });
        this.emit(`db/change/${instance.userId}`, {
          event: "create",
          model: instance.$modelOptions.name.singular,
          id: instance.id
        });
      }
    });
  }
}

const eventService = new EventService();
export default eventService;
