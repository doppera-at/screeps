
export enum ResultType {
    OK = 0,
    FINISHED = 1,
}
export enum ErrorType {
    NO_TARGET = -1,
    INVALID_TARGET = -2,
}

export interface IError {
    getType(): ErrorType;
    getMsg(): string;
}
export class Error implements IError {
    private type: ErrorType;
    private msg?: string;

    constructor(type: ErrorType, msg?: string) {
        this.type = type;
        this.msg = msg;
    }

    getType(): ErrorType {
        return this.type;
    }
    getMsg(): string {
        return this.msg || "";
    }
}


export type Result<T, E> = Ok<T> | Err<E>;
export interface IResult<T, E> {
    ok(): boolean;
    err(): boolean;

    getValue(): T | null;
    getError(): E | null;
}
export class Ok<T> implements IResult<T, never> {
    
    private value?: T;

    constructor(type: ResultType, value?: T) {
        this.value = value;
    }


    ok(): boolean {
        return true;
    }
    err(): boolean {
        return false;
    }

    getValue(): T | null {
        return this.value || null;
    }
    getError(): null {
        return null;
    }
}

export class Err<E> implements IResult<never, E> {

    private error: E;

    constructor(error: E) {
        this.error = error;
    }


    ok(): boolean {
        return false;
    }
    err(): boolean {
        return true;
    }

    getValue(): null {
        return null;
    }
    getError(): E {
        return this.error;
    }
}