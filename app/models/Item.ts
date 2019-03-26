import {
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
  BeforeDestroy
} from "sequelize-typescript";
import { BaseModel } from "../libraries/BaseModel";
import { ItemInstance } from "./ItemInstance";
import * as fs from "fs";
import * as path from "path";
import { config } from "../config/config";

export const ItemUploadDir = path.join(__dirname, "/../../public/uploads/");
export const ItemDownloadUrl = `${config.urls.base}/uploads/`;

@Table({
  tableName: "item"
})
export class Item extends BaseModel<Item> {
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

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  model3d: string;

  get model3dUrl(): string {
    return `${ItemDownloadUrl}${this.getDataValue("model3d")}`;
  }

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null
  })
  preview: string;

  get previewUrl(): string {
    return `${ItemDownloadUrl}${this.getDataValue("preview")}`;
  }

  @Column({
    type: DataType.ENUM("private", "public"),
    allowNull: false,
    defaultValue: "private"
  })
  type: "private" | "public";

  @BeforeDestroy
  static deleteChilds(item: Item, options: any) {
    return Promise.all([
      item.deleteModel3dFile(),
      item.deletePreviewFile(),
      ItemInstance.destroy({ where: { itemId: item.id }, individualHooks: true })
    ]);
  }

  deleteModel3dFile(): Promise<boolean> {
    if (this.model3d == null || !this.model3d.length) return Promise.resolve(false);
    let r: boolean = false;
    return new Promise((resolve, reject) => {
      fs.unlink(path.join(ItemUploadDir, this.model3d), err => {
        if (err) return resolve(false);
        resolve(true);
      });
    })
      .then((result: boolean) => {
        r = result;
        this.model3d = null;
        return this.save();
      })
      .then(() => r);
  }

  deletePreviewFile(): Promise<boolean> {
    if (this.preview == null || !this.preview.length) return Promise.resolve(false);
    let r: boolean = false;
    return new Promise((resolve, reject) => {
      fs.unlink(path.join(ItemUploadDir, this.preview), err => {
        if (err) return resolve(false);
        resolve(true);
      });
    })
      .then((result: boolean) => {
        r = result;
        this.preview = null;
        return this.save();
      })
      .then(() => r);
  }
}
