export class MoveTask {
    creep: Creep;
    target: RoomPosition | Structure | Source;

    constructor(creep: Creep, target: RoomPosition | Structure | Source) {
        this.creep = creep;
        this.target = target;
    }

    public run() {
        if (!this.target) return ERR_NOT_FOUND;
        if (this.creep.pos.inRangeTo(this.target, 1)) return OK;

    }
}
