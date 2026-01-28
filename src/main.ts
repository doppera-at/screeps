import { ErrorMapper } from "utils/ErrorMapper";
import { LoggerFactory, Logger, Level } from "utils/Logger";
import { SpawnManager } from "manager/Spawn";
import { TaskManager } from "manager/Task";
import { getName } from "utils/Names";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definition alone.
          You must also give them an implementation if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    rooms: { [name: string]: RoomMemory; };
    sources: { [name: string]: SourceMemory; };
    // uuid: number;
    // log: any;
  }

  interface CreepMemory {
    // role: string;
    room: string;
    working: boolean;
    task: string;
    spawn: Id<StructureSpawn>;
    target?: Id<AnyStructure> | Id<Source>;
  }

  interface SourceMemory {
    id: Id<Source>;
    room: string;
    creeps: string[];
    container: boolean;
  }

  interface TaskMemory {
    id: number;
    type: string;
    target: string;
    assignedCreeps: string[];
  }
}
// Syntax for adding properties to `global` (ex "global.log")
declare const global: {
  log: LoggerFactory;
  spawn: SpawnManager;


  SPAWN_NAME: string;
}
global.SPAWN_NAME = "Spawn1";








// ===== Variables =====

let initialized: boolean = false;

let logger: Logger;

let spawn: StructureSpawn;
let source: Source;


// ===== Initialization =====

function init() {
  if (initialized) return;

  global.log = new LoggerFactory(Level.DEBUG);
  logger = global.log.getLogger("main");

  spawn = Game.spawns[global.SPAWN_NAME];
  source = spawn.room.find(FIND_SOURCES)[0];

  global.spawn = new SpawnManager(global.log.getLogger("SpawnManager"));
  global.spawn.addSpawn(spawn);

  initialized = true;
  logger.info(`Game reset, initialization complete.`);
}



// ===== Functions getting Targets =====

function getDeliveryTarget(creep: Creep) {
  const amount = creep.store.getUsedCapacity();
  logger.debug(`getDeliveryTarget: Amount ${amount}`)

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
  logger.debug(`Found ${targets.length} delivery targets`);

  if (targets.length > 0) {
    const target = creep.pos.findClosestByPath(targets);
    logger.debug(`target: ${target}`);
    // Memory.creeps[creep.name].target = target.id;
    return target;
  }

  return creep.room.controller || null;
}


// ===== Main Loop =====

export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`\n========== Tick: ${Game.time} (R ${!initialized})`);
  init();

  logger.debug(`Spawn: ${spawn}, Source: ${source}`);
  global.spawn.stat();



  global.spawn.run(global.SPAWN_NAME);





  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }



  for (const name in Game.creeps) {
    const creep = Game.creeps[name];

    if (!Memory.creeps[name].task) Memory.creeps[name].task = "harvest";

    const task = Memory.creeps[name].task;
    const targetId = Memory.creeps[name].target;
    logger.debug(`Creep: ${creep}, Task: ${task}, Target: ${targetId}`);

    switch (task) {
      case "harvest":
        const harvestResult = creep.harvest(source);
        logger.debug(`Harvest result`, harvestResult);
        if (ERR_NOT_IN_RANGE == harvestResult) {
          const moveResult = creep.moveTo(source);
          logger.debug(`Move result`, moveResult);
        }
        break;

      case "deliver":
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
      if (creep.store.getFreeCapacity() == 0) Memory.creeps[name].task = "deliver";
    }

  }
});
