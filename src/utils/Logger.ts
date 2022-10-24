import * as _ from 'lodash';
const { version } = require('../../package.json');
import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, label, printf, align } = format;
import  { SPLAT } from 'triple-beam';

// const { models } = require("./config/env/production");
const all = format((info) => {
 const splat = info[SPLAT] || [];
 if(!info.message) {
    info.message = 'None';
 }

 const message = formatObject(info.message);
 const rest = splat.map(formatObject).join(' ');
 info.message = `${message.replace(/\s(info|warn|error):/i, '')} ${rest}`;
 return info;
});
const customLogger = createLogger({
 format: combine(
   all(),
   label({ label: version }),
   timestamp(),
   colorize(),
   align(),
   printf(info => `${info.timestamp} [${info.label}] ${info.level}: ${formatObject(info.message)}`)
 ),
 transports: [new transports.Console()]
});

function formatObject(param) {
 if (_.isObject(param)) {
   return JSON.stringify(param);
 }
 return param;
}

const Logger = {
    logLevel: {
        info: (item) => {
            customLogger.log('info', item)
        },
        debug: (item) => {
            customLogger.log('debug', item)
        },
        err: (item) => {
            customLogger.log('error', item)
        }
    },

    log(message: any) {
        customLogger.log('info', message);
    }
}

export default Logger;
