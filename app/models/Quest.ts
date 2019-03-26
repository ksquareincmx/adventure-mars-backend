import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  BeforeDestroy
} from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import { Unit } from "./Unit";
import { FoundItem } from "./FoundItem";
import { ItemInstance } from "./ItemInstance";
import { QuestRun } from "./QuestRun";

@Table({
  tableName: "quest"
})
export class Quest extends BaseModel<Quest> {
  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  name: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  published: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  showDistance: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false
  })
  paused: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null
  })
  startTime: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
    defaultValue: null
  })
  endTime: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null
  })
  timeLimit: number;

  @ForeignKey(() => Unit)
  @Column
  unitId: number;

  @BelongsTo(() => Unit)
  unit: Unit;

  @BeforeDestroy
  static deleteChilds(quest: Quest, options: any) {
    return Promise.all([
      ItemInstance.destroy({ where: { questId: quest.id }, individualHooks: true }),
      FoundItem.destroy({ where: { questId: quest.id }, individualHooks: true }),
      QuestRun.destroy({ where: { questId: quest.id }, individualHooks: true })
    ]);
  }
}
