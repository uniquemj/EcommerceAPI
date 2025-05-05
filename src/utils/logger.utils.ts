import winston from 'winston';


const customFormat = winston.format.printf(({timestamp, level, message, stack, ...metadata})=>{
    let obj: Record<string, unknown> | undefined;

    for(let key in metadata){
        if(!obj){
            obj = {};
        }
        obj[key] = metadata[key]
    }
    return `${timestamp} [${level}] : ${message} ${obj ? "\n\t" + JSON.stringify(obj) : ""}${stack ? "\n" + stack: ""} `
})

export class Logger{
    private static instance: Logger;
    private constructor(){}
    
    static getInstance(){
        if(!Logger.instance){
            Logger.instance = new Logger()
        }
        return Logger.instance
    }

    logger(){
        return winston.createLogger({
            level: process.env.LOG_LEVEL || 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.timestamp({format: "Do MMM, YYYY hh:mm:ss A Z"}),
                customFormat
            ),
            transports:[
                new winston.transports.Console()
            ]
        })
    }

}


export default Logger