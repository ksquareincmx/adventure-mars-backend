import {
  Table,
  Column,
  HasOne,
  DataType,
  BelongsTo,
  BeforeBulkCreate,
  BeforeCreate,
  AfterCreate,
  BeforeUpdate,
  BeforeBulkUpdate,
  ForeignKey,
  BeforeDelete,
  HasMany
} from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import * as bcrypt from "bcrypt";
import * as _ from "lodash";
import { Unit } from "./Unit";
import { QuestRun } from "./QuestRun";
import { FoundItem } from "./FoundItem";
import { GeoPoint } from "../libraries/util";
import { log } from "../libraries/Log";

@Table({
  tableName: "user"
})
export class User extends BaseModel<User> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  team: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isLength: {
        min: 5
      }
    }
  })
  password: string;

  @Column({
    type: DataType.ENUM("scout", "leader", "admin"),
    allowNull: false,
    defaultValue: "scout"
  })
  role: "scout" | "leader" | "admin";

  @Column({
    type: DataType.GEOMETRY("POINT"),
    allowNull: true,
    defaultValue: null
  })
  get currentLocation(): GeoPoint | string {
    return this.getDataValue("currentLocation");
  }
  set currentLocation(val: GeoPoint | string) {
    if (val == null) return;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch (err) {
        log.error(err);
      }
    }
    this.setDataValue("currentLocation", val);
  }

  @ForeignKey(() => Unit)
  @Column
  unitId: number;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BeforeBulkCreate
  @BeforeBulkUpdate
  static activateIndividualHooks(items: Array<User>, options: any) {
    options.individualHooks = true;
  }

  @BeforeCreate
  static addPassword(user: User, options: any) {
    return user.updatePassword();
  }

  @AfterCreate
  static afterCreateHook(user: User, options: any) {}

  @BeforeUpdate
  static changePassword(user: User, options: any) {
    if (user.changed("password")) {
      return user.updatePassword();
    }
    return Promise.resolve();
  }

  @BeforeDelete
  static deleteChilds(user: User, options: any) {
    return Promise.all([
      QuestRun.destroy({ where: { userId: user.id }, individualHooks: true }),
      FoundItem.destroy({ where: { userId: user.id }, individualHooks: true })
    ]);
  }

  authenticate(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  hashPassword(password: string): Promise<string> {
    if (password == null || password.length < 5) throw new Error("Invalid password");
    return bcrypt.hash(password, 10);
  }

  updatePassword(): Promise<void> {
    return this.hashPassword(this.password).then(result => {
      this.password = result;
      return null;
    });
  }

  toJSON() {
    let object = super.toJSON();
    delete object.password;
    delete object.createdAt;
    delete object.updatedAt;
    return object;
  }
}
