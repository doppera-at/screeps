import { TaskType } from "../utils/TypeDefinitions";

export class BaseTask {

  private id: number;
  private type: TaskType

  constructor(id: number, type: TaskType) {
    this.id = id;
    this.type = type;
  }


  public getId(): number {
    return this.id;
  }
  public getType(): TaskType {
    return this.type;
  }
}


export class CreepTask extends BaseTask {

  private creep: Creep;

  constructor(id: number, type: TaskType, creep: Creep) {
    super(id, type);
    this.creep = creep;
  }


  public getCreep(): Creep {
    return this.creep;
  }
}
