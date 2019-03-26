import { Table, Column, DataType, BelongsTo, ForeignKey } from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import { User } from "./User";
import { Quest } from "./Quest";

@Table({
  tableName: "questrun"
})
export class QuestRun extends BaseModel<QuestRun> {
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
  startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null
  })
  finishTime: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  completed: boolean;
}
