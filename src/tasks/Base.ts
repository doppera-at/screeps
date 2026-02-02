import { TaskType } from "../utils/TypeDefinitions";
import { Logger } from "../utils/Logger";

export class BaseTask {

  protected id: number;
  protected type: TaskType;
  protected logger: Logger;

  constructor(id: number, type: TaskType, logger: Logger) {
    this.id = id;
    this.type = type;
    this.logger = logger;
  }


  public getId(): number {
    return this.id;
  }
  public getType(): TaskType {
    return this.type;
  }
}


export class CreepTask extends BaseTask {

  protected creep: Creep;

  constructor(id: number, type: TaskType, creep: Creep, logger: Logger) {
    super(id, type, logger);
    this.creep = creep;
  }


  public getCreep(): Creep {
    return this.creep;
  }
}
