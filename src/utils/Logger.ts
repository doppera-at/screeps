export enum Level {
    ERROR = 20,
    WARN = 30,
    STAT = 50,
    INFO = 60,
    DEBUG = 100,
    FINE = 150,
    FINER = 200,
    ALL = 255,
}

export class LoggerFactory {

    private level: Level;

    constructor(level: Level) {
        this.level = level;
    }

    public getLogger(module: string): Logger {
        return new Logger(module, this.level);
    }
}

export class Logger {

    private module: string;
    private method?: string;
    private level: Level;

    private output: string;

    constructor(module: string, level: Level, method?: string) {
        this.module = module;
        this.method = method;
        this.level = level;

        this.output = `[${Level[level]}] ${this.module}` + (this.method ? `:${this.method}> ` : "> ");
    }


    public log(message: string, level: Level, result?: number) {
        if (level > this.level) return;

        let resultString = this.output + message;
        if (result !== undefined) resultString += ` (${result}) ${this.getResultString(result)}`;

        console.log(resultString);
    }

    public error(message: string, result?: number) {
        this.log(message, Level.ERROR, result);
    }
    public warn(message: string, result?: number) {
        this.log(message, Level.WARN, result);
    }
    public stat(message: string, result?: number) {
        this.log(message, Level.STAT, result);
    }
    public info(message: string, result?: number) {
        this.log(message, Level.INFO, result);
    }
    public debug(message: string, result?: number) {
        this.log(message, Level.DEBUG, result);
    }
    public fine(message: string, result?: number) {
        this.log(message, Level.FINE, result);
    }
    public finer(message: string, result?: number) {
        this.log(message, Level.FINER, result);
    }


    private getResultString(result: number) {
        switch (result) {
            case OK: return "OK";
            case ERR_NOT_FOUND: return "NotFound";
            case ERR_FULL: return "Full";
            default: return "";
        }
    }
}
