import { Table, Column, DataType, BelongsTo, ForeignKey, BeforeDelete } from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import { Quest } from "./Quest";
import { Item } from "./Item";
import { GeoPoint } from "../libraries/util";
import { Unit } from "./Unit";
import { FoundItem } from "./FoundItem";
import { log } from "../libraries/Log";

@Table({
  tableName: "iteminstance"
})
export class ItemInstance extends BaseModel<ItemInstance> {
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
  description: string;

  @ForeignKey(() => Item)
  @Column
  itemId: number;

  @BelongsTo(() => Item)
  item: Item;

  @ForeignKey(() => Quest)
  @Column
  questId: number;

  @BelongsTo(() => Quest)
  quest: Quest;

  @ForeignKey(() => Unit)
  @Column
  unitId: number;

  @BelongsTo(() => Unit)
  unit: Unit;

  @Column({
    type: DataType.GEOMETRY("POINT"),
    allowNull: true,
    defaultValue: null
  })
  get location(): GeoPoint | string {
    return this.getDataValue("location");
  }
  set location(val: GeoPoint | string) {
    if (val == null) return;
    if (typeof val === "string") {
      try {
        val = JSON.parse(val);
      } catch (err) {
        log.error(err);
      }
    }
    this.setDataValue("location", val);
  }

  @BeforeDelete
  static deleteChilds(itemInstance: ItemInstance, options: any) {
    return Promise.all([
      FoundItem.destroy({ where: { itemInstanceId: itemInstance.id }, individualHooks: true })
    ]);
  }
}
