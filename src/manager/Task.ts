import { Logger } from "../utils/Logger";

import { BaseTask } from "../tasks/Base";
import { HardcodedSupplyTask } from "../tasks/HardcodedSupply";



export class TaskManager {

  private logger: Logger;

  private tasks: { [id: number]: BaseTask };


  constructor(logger: Logger) {
    this.logger = logger;
    this.tasks = {};
  }


  public addTask(task: BaseTask) {
    if (task.getId() in this.tasks) {
      this.logger.warn(`Tried to add Task ${task.getId()}, ${task.getType} but it was already added`);
      return;
    }
  }


  run() {
    this.logger.info("Run");
  }


}
