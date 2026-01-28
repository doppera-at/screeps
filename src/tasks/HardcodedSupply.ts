import { CreepTask } from "Base";
import { TaskType, ActionType } from "../utils/TypeDefinitions";

export class HardcodedSupplyTask extends CreepTask {

  constructor(id: number, creep: Creep) {
    super(id, TaskType.Hardcoded, creep);
  }


  run() {
    const targetId = Memory.creeps[name].target;
    const action = Memory.creeps[name].action;

    this.logger.debug(`Creep: ${this.creep}, Type: ${this.type}, Target: ${targetId}, Action: ${action}`);

    switch (action) {
      case ActionType.HARVEST:
        const harvestResult = creep.harvest(source);
        this.logger.debug(`Harvest result`, harvestResult);
        if (ERR_NOT_IN_RANGE == harvestResult) {
          const moveResult = creep.moveTo(source);
          this.logger.debug(`Move result`, moveResult);
        }
        if (creep.store.getFreeCapacity() == 0) Memory.creeps[name].task = "deliver";
        break;

      case ActionType.DELIVER:
        let target = Game.getObjectById<AnyStructure | Source>(targetId!);
        if (!target || target instanceof Source) {
          target = getDeliveryTarget(creep);
          logger.debug(`Target: ${target}`);
          if (target) Memory.creeps[name].target = target.id;
          else {
            logger.error(`No delivery target found for creep ${name}`);
            break;
          }
        }

        if (target instanceof Source) {
          delete Memory.creeps[name].target;
          break;
        }

        const transferResult = creep.transfer(target, RESOURCE_ENERGY);
        logger.debug(`Transfer result`, transferResult);
        if (ERR_NOT_IN_RANGE == transferResult) {
          const moveResult = creep.moveTo(target);
          logger.debug(`Move result`, moveResult);
        } else if (ERR_FULL == transferResult) {
          delete Memory.creeps[name].target;
        }
        if (creep.store.getUsedCapacity() == 0) Memory.creeps[name].task = "harvest";
        break;
      default:
        logger.error(`Unknown task ${task} for creep ${name}`);
        break;
    }

    if (task == "harvest") {
      if (ERR_NOT_IN_RANGE == creep.harvest(source)) {
        creep.moveTo(source);
      }
    }

  }

}
