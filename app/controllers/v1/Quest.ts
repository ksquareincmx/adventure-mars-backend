import { Controller } from "./../../libraries/Controller";
import { Quest } from "./../../models/Quest";
import { QuestRun } from "../../models/QuestRun";
import { Op } from "sequelize";
import { Request, Response, Router } from "express";
import {
  validateJWT,
  filterOwner,
  appendUser,
  stripNestedObjects,
  filterRoles
} from "./../../policies/General";
import { appendUnit, filterUnit } from "./../../policies/Unit";
import { onlyPublishedToScouts } from "./../../policies/Quest";

export class QuestController extends Controller {
  constructor() {
    super();
    this.name = "quest";
    this.model = Quest;
  }

  routes(): Router {
    /**
      @api {get} /api/v1/quest/ Get list of quests
      @apiPermission access (leaders and scouts only get quests from their units, scouts only get published quests)
      @apiName GetQuests
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of Quests
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Quest name
      @apiSuccess {Boolean} body.published          If the Quest is published
      @apiSuccess {Boolean} body.paused             If the Quest is paused
      @apiSuccess {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiSuccess {Date} body.startTime             Start time of the quest
      @apiSuccess {Date} body.endTime               End time of the quest
      @apiSuccess {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiSuccess {Number} body.unitId              Id of the unit that owns this Quest
    */
    this.router.get("/", validateJWT("access"), onlyPublishedToScouts(), filterUnit(), (req, res) =>
      this.find(req, res)
    );

    /**
      @api {get} /api/v1/quest/scout Get list of quests with data for a certain scout
      @apiPermission scout
      @apiName GetQuestsScout
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object[]} body                   List of Quests
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Quest name
      @apiSuccess {Boolean} body.published          If the Quest is published
      @apiSuccess {Boolean} body.paused             If the Quest is paused
      @apiSuccess {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiSuccess {Date} body.startTime             Start time of the quest
      @apiSuccess {Date} body.endTime               End time of the quest
      @apiSuccess {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiSuccess {Number} body.unitId              Id of the unit that owns this Quest
      @apiSuccess {Number} body.unitId              Id of the unit that owns this Quest
      @apiSuccess {Boolean} body.completed          If the current user has completed this quest
      @apiSuccess {Date} body.startRunTime          When the current user started this quest
      @apiSuccess {Date} body.finishRunTime         When the current user completed this quest
    */
    this.router.get(
      "/scout",
      validateJWT("access"),
      filterRoles(["scout"]),
      onlyPublishedToScouts(),
      filterUnit(),
      (req, res) => this.findFromScout(req, res)
    );

    /**
      @api {post} /api/v1/quest/scout/start Start or resume a quest by a scout
      @apiPermission scout
      @apiName PostQuestsScoutStart
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Number} questId                    Id of the Quest to start

      @apiSuccess {Object} body                     Data response
      @apiSuccess {Boolean} body.success            If we are allowed to start (if the quest was already started and the time limit of the quest is over, we will get false)
      @apiSuccess {Date} body.startTime             Start Time
      @apiSuccess {Number} body.timeLimit           Quest Time limit
    */
    this.router.post(
      "/scout/start",
      validateJWT("access"),
      filterRoles(["scout"]),
      stripNestedObjects(),
      (req, res) => this.startQuestScout(req, res)
    );

    /**
      @api {get} /api/v1/quest/:id Get one Quest
      @apiPermission access (leaders and scouts only get quests from their units, scouts only get published quests)
      @apiName GetQuest
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiSuccess {Object} body                     Quest
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Quest name
      @apiSuccess {Boolean} body.published          If the Quest is published
      @apiSuccess {Boolean} body.paused             If the Quest is paused
      @apiSuccess {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiSuccess {Date} body.startTime             Start time of the quest
      @apiSuccess {Date} body.endTime               End time of the quest
      @apiSuccess {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiSuccess {Number} body.unitId              Id of the unit that owns this Quest
    */
    this.router.get(
      "/:id",
      validateJWT("access"),
      onlyPublishedToScouts(),
      filterUnit(),
      (req, res) => this.findOne(req, res)
    );

    /**
      @api {post} /api/v1/quest/ Create Quest
      @apiPermission admin, leader (leader can only create Quest for his unit)
      @apiName PostQuest
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Quest
      @apiParam {String} body.name                Quest name
      @apiParam {Boolean} body.published          If the Quest is published
      @apiParam {Boolean} body.paused             If the Quest is paused
      @apiParam {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiParam {Date} body.startTime             Start time of the quest
      @apiParam {Date} body.endTime               End time of the quest
      @apiParam {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiParam {Number} body.unitId              Id of the unit that owns this Quest

      @apiSuccess {Object} body                     Quest
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Quest name
      @apiSuccess {Boolean} body.published          If the Quest is published
      @apiSuccess {Boolean} body.paused             If the Quest is paused
      @apiSuccess {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiSuccess {Date} body.startTime             Start time of the quest
      @apiSuccess {Date} body.endTime               End time of the quest
      @apiSuccess {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiSuccess {Number} body.unitId              Id of the unit that owns this Quest
    */
    this.router.post(
      "/",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      stripNestedObjects(),
      appendUnit(),
      (req, res) => this.create(req, res)
    );

    /**
      @api {put} /api/v1/quest/:id Modify Quest
      @apiPermission admin, leader (leader can only modify Quests for his unit)
      @apiName PutQuest
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]

      @apiParam {Object} body                     Quest
      @apiParam {Number} body.id                  Item id
      @apiParam {String} body.name                Quest name
      @apiParam {Boolean} body.published          If the Quest is published
      @apiParam {Boolean} body.paused             If the Quest is paused
      @apiParam {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiParam {Date} body.startTime             Start time of the quest
      @apiParam {Date} body.endTime               End time of the quest
      @apiParam {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiParam {Number} body.unitId              Id of the unit that owns this Quest

      @apiSuccess {Object} body                     Quest
      @apiSuccess {Number} body.id                  Item id
      @apiSuccess {String} body.name                Quest name
      @apiSuccess {Boolean} body.published          If the Quest is published
      @apiSuccess {Boolean} body.paused             If the Quest is paused
      @apiSuccess {Boolean} body.showDistance       If we are showing the distance to the objects in the UI
      @apiSuccess {Date} body.startTime             Start time of the quest
      @apiSuccess {Date} body.endTime               End time of the quest
      @apiSuccess {Number} body.timeLimit           Time limit for this Quest (in Minutes)
      @apiSuccess {Number} body.unitId              Id of the unit that owns this Quest
    */
    this.router.put(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      stripNestedObjects(),
      filterUnit(),
      appendUnit(),
      (req, res) => this.update(req, res)
    );

    /**
      @api {delete} /api/v1/quest/:id Delete Quest
      @apiPermission admin, leader (leader can only modify Quests for his unit)
      @apiName DeleteQuest
      @apiGroup Quest

      @apiHeader { String } Content-Type Application/Json
      @apiHeader { String } Authorization Bearer [jwt token]
    */
    this.router.delete(
      "/:id",
      validateJWT("access"),
      filterRoles(["admin", "leader"]),
      filterUnit(),
      (req, res) => this.destroy(req, res)
    );

    return this.router;
  }

  startQuestScout(req: Request, res: Response) {
    let userId = req.session.jwt.id;
    let questId = req.body.questId;
    if (questId == null) return Controller.badRequest(res, "Missing questId in body");

    let results: any = {};

    Quest.findOne({ where: { id: questId, unitId: req.session.jwt.unitId } })
      .then((quest: Quest) => {
        if (!quest) {
          Controller.notFound(res, "Requested Quest not found");
          throw null;
        }
        results.quest = quest;
        // Check if the quest is paused or not published
        // TODO: Check if the quest is open by time
        if (results.quest.paused || !results.quest.published) {
          res.status(200).json({
            success: false,
            startTime: null,
            timeLimit: null
          });
          throw null;
        }
        return QuestRun.findOne({ where: { userId, questId } });
      })
      .then((questRun: QuestRun) => {
        if (!questRun) {
          // Create new QuestRun
          return QuestRun.create({
            questId,
            userId,
            startTime: new Date(),
            finishTime: null,
            completed: false
          });
        }
        return questRun;
      })
      .then((questRun: QuestRun) => {
        const now = new Date();
        const timeLimit = results.quest.timeLimit;
        // Check if the scout is allowed to start or continue this quest
        let success = true;
        const elapsedMinutes = (now.getTime() - questRun.startTime.getTime()) / 1000 / 60;
        // Check by time limit
        if (elapsedMinutes > timeLimit) success = false;
        // Check if the quest was already completed
        if (questRun.completed) success = false;

        const startRes = {
          success,
          startTime: questRun.startTime,
          timeLimit
        };
        return res.status(200).json(startRes);
      })
      .catch(err => {
        if (err) Controller.serverError(res, err);
      });
  }

  findFromScout(req: Request, res: Response) {
    // Append completed and finishTime information to quest
    let userId = req.session.jwt.id;
    let quests: any = null;
    Quest.findAndCountAll({
      where: this.parseWhere(req),
      limit: this.parseLimit(req),
      offset: this.parseOffset(req),
      order: this.parseOrder(req),
      include: this.parseInclude(req)
    })
      .then(result => {
        res.set("Content-Count", String(result.count));
        quests = result.rows;
        const questIds: number[] = quests.map(item => item.id);
        return QuestRun.findAll({
          where: {
            questId: { [Op.in]: questIds },
            userId
          }
        });
      })
      .then((questRuns: QuestRun[]) => {
        quests = quests.map(quest => {
          // Convert Sequelize object to plain object
          quest = quest.toJSON();
          // Prepare new schema
          quest.completed = false;
          quest.finishRunTime = null;
          quest.startRunTime = null;
          const questRun = questRuns.find(item => item.questId === quest.id);
          if (questRun != null) {
            quest.completed = questRun.completed;
            quest.finishRunTime = questRun.finishTime;
            quest.startRunTime = questRun.startTime;
          }
          return quest;
        });
        res.status(200).json(quests);
        return null;
      })
      .catch(err => {
        if (err) Controller.serverError(res, err);
      });
  }
}

const quest = new QuestController();
export default quest;
