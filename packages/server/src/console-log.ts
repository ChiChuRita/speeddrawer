import chalk from "chalk";

export enum InfoLevel {
    INFO,
    WARNING,
    ERROR,
}

export const consoleLog = (msg: string, level: InfoLevel) => {
    let prefix;
    switch (level) {
        case InfoLevel.INFO:
            prefix = chalk.white("[Info]");
            break;
        case InfoLevel.WARNING:
            prefix = chalk.yellow("[Warning]");
            break;
        case InfoLevel.ERROR:
            prefix = chalk.red("[Error]");
            break;
    }
    console.log(`${prefix} ${msg}`);
};
