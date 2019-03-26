import { Table, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import { User } from "./User";
import { Quest } from "./Quest";
import { ItemInstance } from "./ItemInstance";

@Table({
  tableName: "founditem"
})
export class FoundItem extends BaseModel<FoundItem> {
  @ForeignKey(() => ItemInstance)
  @Column
  itemInstanceId: number;

  @BelongsTo(() => ItemInstance)
  itemInstance: ItemInstance;

  @ForeignKey(() => Quest)
  @Column
  questId: number;

  @BelongsTo(() => Quest)
  quest: Quest;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW
  })
  time: Date;
}
