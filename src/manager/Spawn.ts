import { Logger } from "../utils/Logger";
import { getName } from "../utils/Names";
import { ActionType, TaskType } from "../utils/TypeDefinitions";

const BODY_DEFAULT: BodyPartConstant[] = [WORK, CARRY, MOVE];

export class SpawnManager {

  private logger: Logger;
  private spawns: { [key: string] : StructureSpawn };

  constructor(logger: Logger) {
    this.logger = logger;
    this.spawns = {};
  }


  public stat() {
    this.logger.stat(`Spawns: ${JSON.stringify(Object.keys(this.spawns))}`);
  }


  public addSpawn(spawn: StructureSpawn) {
    if (spawn.name in this.spawns) {
      this.logger.warn(`Tried to add '${spawn.name}' although it is aleady added..`);
      return;
    }

    this.spawns[spawn.name] = spawn;
    this.logger.info(`Spawn '${spawn.name}' added.`);
  }


  public run(spawnName: string) {
    if (Object.keys(Game.creeps).length > 2) {
      return;
    }

    const spawn = this.spawns[spawnName] ?? null;
    if (!spawn) {
      this.logger.error(`Invalid spawnName: ${spawnName}`);
      return;
    }

    const spawnEnergy = spawn.store.getUsedCapacity(RESOURCE_ENERGY)
    const bodyCost = this.getCostForBody(BODY_DEFAULT)
    if (spawnEnergy < bodyCost) {
      this.logger.info(`Skipping spawn because lack of energy: ${spawnEnergy} < ${bodyCost} (Body: ${BODY_DEFAULT})`)
      return;
    }

    const creepName = getName();
    this.logger.debug(`Spawning Creep: ${creepName}`);
    const result = spawn.spawnCreep(BODY_DEFAULT, creepName, {
      memory: {
        task: TaskType.HARDCODED,
        action: ActionType.HARVEST,
        spawn: spawn.id,
        room: spawn.room.name,
      }
    });
    this.logger.info(`Attempt of spawning a creep`, result);
  }


  public getCostForBody(body: BodyPartConstant[]): number {
    let cost = 0;
    for (const part of body) {
      cost += BODYPART_COST[part] | 0;
    }
    return cost;
  }
}
