import { CreepTask } from "../tasks/Base";
import { TaskType, ActionType } from "../utils/TypeDefinitions";
import { Logger } from "../utils/Logger";

export class HardcodedSupplyTask extends CreepTask {

  constructor(id: number, creep: Creep, logger: Logger) {
    super(id, TaskType.HARDCODED, creep, logger);
  }


  getDeliveryTarget(creep: Creep) {
    const amount = creep.store.getUsedCapacity();
    this.logger.debug(`getDeliveryTarget: Amount ${amount}`)

    const targets = creep.room.find(FIND_MY_STRUCTURES, {
      filter: (structure) => {
        switch (structure.structureType) {
          case STRUCTURE_EXTENSION:
          case STRUCTURE_SPAWN:
          case STRUCTURE_TOWER:
            if (structure.store.getFreeCapacity(RESOURCE_ENERGY) >= amount) {
              return true;
            }
          default:
            break;
        }
        return false;
      }
    });
    this.logger.debug(`Found ${targets.length} delivery targets`);

    if (targets.length > 0) {
      const target = creep.pos.findClosestByPath(targets);
      this.logger.debug(`target: ${target}`);
      // Memory.creeps[creep.name].target = target.id;
      return target;
    }

    return creep.room.controller || null;
  }



  run() {
    const creep: Creep = this.creep;
    const action = Memory.creeps[creep.name].action;

    this.logger.debug(`Creep: ${this.creep}, Type: ${this.type}, Target: ${Memory.creeps[creep.name].target}, Action: ${action}`);

    switch (action) {
      case ActionType.HARVEST:
        const harvestTargetId: Id<Source> | Id<AnyStructure> | undefined = Memory.creeps[creep.name].target;
        if (!harvestTargetId) {
          this.logger.warn(`No Target for HardcodedSupply Task, requesting new one`);
          return ERR_NOT_FOUND;
        }
        const harvestTarget: Source | AnyStructure | null = Game.getObjectById(harvestTargetId);
        if (!harvestTarget || !(harvestTarget instanceof Source)) {
          this.logger.warn(`Invalid Target (not set or not a Source): ${harvestTargetId}`);
          return ERR_INVALID_TARGET;
        }
        const harvestResult = creep.harvest(harvestTarget);
        this.logger.debug(`Harvest result`, harvestResult);
        if (ERR_NOT_IN_RANGE == harvestResult) {
          const moveResult = creep.moveTo(harvestTarget);
          this.logger.debug(`Move result`, moveResult);
          return harvestResult;
        }
        if (creep.store.getFreeCapacity() == 0) Memory.creeps[creep.name].action = ActionType.DELIVER;
        break;

      case ActionType.DELIVER:
        const deliveryTargetId: Id<Source> | Id<AnyStructure> | undefined = Memory.creeps[creep.name].target;
        if (!deliveryTargetId) {
          this.logger.warn(`No Target for HardcodedSupply-Task, requesting new one`);
          return ERR_NOT_FOUND;
        }
        const deliveryTarget: Source | AnyStructure | null = Game.getObjectById(deliveryTargetId);
        if (!deliveryTarget || deliveryTarget instanceof Source) {
          this.logger.warn(`Invalid Target (not set or a Source): ${deliveryTargetId}`);
          return ERR_INVALID_TARGET;
        }
        const deliveryResult = creep.transfer(deliveryTarget, RESOURCE_ENERGY);
        this.logger.debug(`Delivery result`, deliveryResult);
        if (ERR_NOT_IN_RANGE == deliveryResult) {
          const moveResult = creep.moveTo(deliveryTarget);
          this.logger.debug(`Move result`, moveResult);
          return deliveryResult;
        }
        if (creep.store.getUsedCapacity() == 0) Memory.creeps[creep.name].action = ActionType.HARVEST;
        break;
      default:
        this.logger.error(`Unknown action ${action} for creep ${creep.name}`);
        return ERR_INVALID_ARGS;
    }

    return OK;
  }

}
