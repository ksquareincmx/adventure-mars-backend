import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  HasMany,
  BeforeDestroy
} from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import { User } from "./User";
import { Quest } from "./Quest";

@Table({
  tableName: "unit"
})
export class Unit extends BaseModel<Unit> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  name: string;

  // @HasMany(() => User)
  // users: User[];

  @BeforeDestroy
  static deleteChilds(unit: Unit, options: any) {
    return Promise.all([
      Quest.destroy({ where: { unitId: unit.id }, individualHooks: true }),
      User.destroy({ where: { unitId: unit.id }, individualHooks: true })
    ]);
  }
}
