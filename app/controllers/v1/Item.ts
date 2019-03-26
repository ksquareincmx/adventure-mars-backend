import { Controller } from "./../../libraries/Controller";
import { Item, ItemUploadDir } from "./../../models/Item";
import { Request, Response, Router } from "express";
import {
  validateJWT,
  filterOwner,
  appendUser,
  stripNestedObjects,
  filterRoles
} from "./../../policies/General";
import { onlyPublicToLeaders } from "./../../policies/Item";
import { IncomingForm } from "formidable";
import * as path from "path";
import { log } from "../../libraries/Log";

export class ItemController extends Controller {
  constructor() {
    super();
    this.name = "item";
    this.model = Item;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/item/ Get list of items
      @apiPermission admin, leader (leaders only get public items)
      @apiName GetItems
      @apiGroup Item

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of Items
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Item name
      @apiSuccess {String} body.description         Item description
      @apiSuccess {String} body.model3d             3d model path
      @apiSuccess {String} body.model3dUrl          3d model url
      @apiSuccess {String} body.preview             Preview image path
      @apiSuccess {String} body.previewUrl          Preview image url
      @apiSuccess {String} body.type                Type of the Item ("private", "public")
    */
    this.router.get(
      "/",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      onlyPublicToLeaders(),
      (req, res) => this.find(req, res)
    );

    /**
      @api {get} /api/v1/item/:id Get one Item
      @apiPermission admin, leader (leaders only get public items)
      @apiName GetItem
      @apiGroup Item

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object} body                     Item
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Item name
      @apiSuccess {String} body.description         Item description
      @apiSuccess {String} body.model3d             3d model path
      @apiSuccess {String} body.model3dUrl          3d model url
      @apiSuccess {String} body.preview             Preview image path
      @apiSuccess {String} body.previewUrl          Preview image url
      @apiSuccess {String} body.type                Type of the Item ("private", "public")
    */
    this.router.get(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      onlyPublicToLeaders(),
      (req, res) => this.findOne(req, res)
    );

    /**
      @api {post} /api/v1/item/ Create Item
      @apiPermission admin
      @apiName PostItem
      @apiGroup Item

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Item
      @apiParam {String} body.name                Item name
      @apiParam {String} body.model3d             3d model path
      @apiParam {String} body.preview             Preview image path (OPTIONAL)
      @apiParam {String} body.type                Type of the Item ("private", "public")

      @apiSuccess {Object} body                     Item
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Item name
      @apiSuccess {String} body.description         Item description
      @apiSuccess {String} body.model3d             3d model path (OPTIONAL)
      @apiSuccess {String} body.model3dUrl          3d model url (OPTIONAL)
      @apiSuccess {String} body.preview             Preview image path
      @apiSuccess {String} body.previewUrl          Preview image url
      @apiSuccess {String} body.type                Type of the Item ("private", "public")
    */
    this.router.post(
      "/",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.create(req, res)
    );

    /**
      @api {put} /api/v1/item/:id Modify Item
      @apiPermission admin
      @apiName PutItem
      @apiGroup Item

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Item
      @apiParam {Number} body.id                  Item id
      @apiParam {String} body.name                Item name
      @apiParam {String} body.description         Item description
      @apiParam {String} body.model3d             3d model path (OPTIONAL)
      @apiParam {String} body.preview             Preview image path (OPTIONAL)
      @apiParam {String} body.type                Type of the Item ("private", "public")

      @apiSuccess {Object} body                     Item
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Item name
      @apiSuccess {String} body.description         Item description
      @apiSuccess {String} body.model3d             3d model path
      @apiSuccess {String} body.model3dUrl          3d model url
      @apiSuccess {String} body.preview             Preview image path
      @apiSuccess {String} body.previewUrl          Preview image url
      @apiSuccess {String} body.type                Type of the Item ("private", "public")
    */
    this.router.put(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin"]),
      stripNestedObjects(),
      (req, res) => this.update(req, res)
    );

    /**
      @api {delete} /api/v1/item/:id Delete Item
      @apiPermission admin
      @apiName DeleteItem
      @apiGroup Item

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete("/:id", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.destroy(req, res)
    );

    /**
      @api {post} /api/v1/item/upload Create Item and Upload 3D model
      @apiPermission admin
      @apiName CreateUploadItemModel
      @apiGroup Item

      @apiHeader { String } Content-Type multipart/form-data
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {File} model3d               3D Model file in http form
      @apiParam {File} preview               Preview image
      @apiParam {String} name                Item name
      @apiParam {String} description         Item description
      @apiParam {String} type                Type of the Item ("private", "public")

      @apiSuccess {Object} body                     Item
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Item name
      @apiSuccess {String} body.description         Item description
      @apiSuccess {String} body.model3d             3d model path
      @apiSuccess {String} body.model3dUrl          3d model url
      @apiSuccess {String} body.preview             Preview image path
      @apiSuccess {String} body.previewUrl          Preview image url
      @apiSuccess {String} body.type                Type of the Item ("private", "public")

    */
    this.router.post("/upload", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.createUploadModel3D(req, res)
    );

    /**
      @api {post} /api/v1/item/:id/upload Upload 3D model for a certain item
      @apiPermission admin
      @apiName UploadItemModel
      @apiGroup Item

      @apiHeader { String } Content-Type multipart/form-data
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {File} model3d               3D Model file in http form (OPTIONAL)
      @apiParam {File} preview               Preview image (OPTIONAL)
      @apiParam {String} name                Item name (OPTIONAL)
      @apiParam {String} description         Item description (OPTIONAL)
      @apiParam {String} type                Type of the Item ("private", "public") (OPTIONAL)

      @apiSuccess {Object} body                     Item
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Item name
      @apiSuccess {String} body.description         Item description
      @apiSuccess {String} body.model3d             3d model path
      @apiSuccess {String} body.model3dUrl          3d model url
      @apiSuccess {String} body.preview             Preview image path
      @apiSuccess {String} body.previewUrl          Preview image url
      @apiSuccess {String} body.type                Type of the Item ("private", "public")

    */
    this.router.post("/:id/upload", validateJWT("access"), filterRoles(["admin"]), (req, res) =>
      this.uploadModel3D(req, res)
    );

    return this.router;
  }

  createUploadModel3D(req, res) {
    const form = new IncomingForm();
    form.keepExtensions = true;
    form.uploadDir = ItemUploadDir;

    form.parse(req, (err, fields, files) => {
      if (err) {
        log.error(err);
        return Controller.serverError(res);
      }
      const { name, description, type } = fields;
      const model3d =
        files && files.model3d && files.model3d.path ? files.model3d.path.split("/").pop() : null;
      const preview =
        files && files.preview && files.preview.path ? files.preview.path.split("/").pop() : null;
      if (
        name == null ||
        description == null ||
        type == null ||
        model3d == null ||
        preview == null
      ) {
        return Controller.badRequest(
          res,
          "No name, description, type, preview file or model3d file in form"
        );
      }
      Item.create({ name, description, type, model3d, preview })
        .then((item: Item) => {
          res.status(201).json(item);
        })
        .catch(err => {
          log.error(err);
          return Controller.serverError(res);
        });
    });
    // Set the path and name to save the file
    form.on("fileBegin", function(name, file) {
      let fileNameParts = file.name.split(".");
      const fileExt = fileNameParts.pop();
      const fileName = fileNameParts.join(".");
      const newFileName = `${fileName}_${new Date().getTime()}.${fileExt}`;
      file.path = path.join(ItemUploadDir, newFileName);
    });
  }

  uploadModel3D(req, res) {
    const id = req.params.id;
    if (id == null) return Controller.badRequest(res, "No id in url");

    Item.findOne({ where: { id } })
      .then((item: Item) => {
        if (!item) return Controller.notFound(res);
        const form = new IncomingForm();
        form.keepExtensions = true;
        form.uploadDir = ItemUploadDir;

        form.parse(req, (err, fields, files) => {
          if (err) {
            log.error(err);
            return Controller.serverError(res);
          }
          let promise = Promise.resolve(false);
          if (files.model3d != null) promise = item.deleteModel3dFile();
          if (files.preview != null) promise = item.deletePreviewFile();
          // Remove any existing file file for this Item before adding new
          promise
            .then(() => {
              // Modify Item model with file name (just name, not the whole path)
              if (files.model3d != null) item.model3d = files.model3d.path.split("/").pop();
              if (files.preview != null) item.preview = files.preview.path.split("/").pop();
              // Modify other item data if included in form
              const { name, description, type } = fields;
              if (name) item.name = name;
              if (description) item.description = description;
              if (type) item.type = type;
              return item.save();
            })
            .then((result: Item) => {
              res.status(201).json(result);
            })
            .catch(err => {
              log.error(err);
              Controller.serverError(res);
            });
        });
        // Set the path and name to save the file
        form.on("fileBegin", function(name, file) {
          let fileNameParts = file.name.split(".");
          const fileExt = fileNameParts.pop();
          const fileName = fileNameParts.join(".");
          const newFileName = `${fileName}_${new Date().getTime()}.${fileExt}`;
          file.path = path.join(ItemUploadDir, newFileName);
        });
      })
      .catch(err => {
        log.error(err);
        return Controller.serverError(res);
      });
  }
}

const item = new ItemController();
export default item;
