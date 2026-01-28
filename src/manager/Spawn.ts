import { Logger } from "../utils/Logger";
import { getName } from "../utils/Names";


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
    if (Object.keys(Game.creeps).length < 2) {
      const creepName = getName();
      this.logger.debug(`Spawning Creep: ${creepName}`);
      const spawn = this.spawns[spawnName] ?? null;
      if (!spawn) {
        this.logger.error(`Invalid spawnName: ${spawnName}`);
      }
      const result = spawn.spawnCreep([WORK, CARRY, MOVE], creepName, {
        memory: {
          task: "harvest",
          spawn: spawn.id,
          room: spawn.room.name,
          working: true,
        }
      });
      this.logger.info(`Attempt of spawning a creep`, result);
    }
  }
}
