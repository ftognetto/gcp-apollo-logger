"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcpApolloLoggerPlugin = exports.GcpApolloLogger = void 0;
const winston_1 = __importDefault(require("winston"));
const logging_winston_1 = require("@google-cloud/logging-winston");
let loggingWinston;
let logger;
let _extractUserFromContext;
const _extractOperationNameFromContext = (ctx) => {
    if (ctx.request.operationName) {
        return ctx.request.operationName;
    }
    else if (ctx.request.query) {
        let opName = ctx.request.query.replace(/\n/g, ' ');
        opName = opName.substring(0, opName.indexOf('('));
        opName = opName.replace('{', '');
        opName = opName.trim();
        return opName;
    }
};
const _extractGraphqlRequestMetadata = (request) => {
    return {
        operationName: request.operationName,
        query: request.query,
        variables: request.variables
    };
};
const _initLogger = () => {
    const serviceContext = process.env.SERVICE_NAME ? { service: process.env.SERVICE_NAME } : undefined;
    loggingWinston = new logging_winston_1.LoggingWinston({
        serviceContext
    });
    const transports = [];
    if (process.env.NODE_ENV === 'development') {
        transports.push(new winston_1.default.transports.Console());
    }
    transports.push(loggingWinston);
    logger = winston_1.default.createLogger({
        level: 'info',
        transports
    });
};
const _handleLog = (log, severity, ctx, reqUser) => {
    var _a;
    if (!logger) {
        _initLogger();
    }
    let message = '';
    let metadata = {};
    if (log instanceof Error || log instanceof Object) {
        metadata = log;
    }
    if (ctx) {
        message += _extractOperationNameFromContext(ctx) + ' - ';
        metadata.httpRequest = {
            status: ((_a = ctx.response) === null || _a === void 0 ? void 0 : _a.http.status) || severity === 'ERROR' ? 500 : severity === 'WARNING' ? 400 : 200,
            requestUrl: (ctx.request.http.headers && ctx.request.http.headers.get('host')) ? ctx.request.http.headers.get('host') : undefined,
            requestMethod: 'POST',
            requestSize: (ctx.request.http.headers && ctx.request.http.headers.get('content-length')) ? ctx.request.http.headers.get('content-length') : undefined,
            userAgent: ctx.request.http.headers && ctx.request.http.headers.get('user-agent')
        };
        if (ctx.request.http.headers && ctx.request.http.headers.get('X-Cloud-Trace-Context')) {
            const [trace] = `${ctx.request.http.headers.get('X-Cloud-Trace-Context')}`.split('/');
            metadata.httpRequest[logging_winston_1.LoggingWinston.LOGGING_TRACE_KEY] = `projects/${process.env.PROJECT_ID}/traces/${trace}`;
        }
        metadata.graphqlRequest = _extractGraphqlRequestMetadata(ctx.request);
    }
    if (reqUser) {
        metadata.reqUser = reqUser;
    }
    else if (_extractUserFromContext) {
        metadata.reqUser = _extractUserFromContext(ctx);
    }
    if (typeof (log) === 'string') {
        message += log;
    }
    else if (log instanceof Error) {
        message += log.message;
    }
    else {
        message += JSON.stringify(log, Object.getOwnPropertyNames(log));
    }
    switch (severity) {
        case 'ERROR':
            logger.error(message, metadata);
            break;
        case 'WARNING':
            logger.warn(message, metadata);
            break;
        default:
            logger.info(message, metadata);
            break;
    }
};
exports.GcpApolloLogger = {
    log(log, ctx, reqUser) {
        _handleLog(log, 'INFO', ctx, reqUser);
    },
    warn(log, ctx, reqUser) {
        _handleLog(log, 'WARNING', ctx, reqUser);
    },
    error(log, ctx, reqUser) {
        _handleLog(log, 'ERROR', ctx, reqUser);
    },
    init(config) {
        if (config.extractUserFromContext) {
            _extractUserFromContext = config.extractUserFromContext;
        }
    }
};
class GcpApolloLoggerPlugin {
    constructor() {
        this.requestDidStart = (ctx) => {
            if (ctx.request.operationName === 'IntrospectionQuery') {
                return {};
            }
            _handleLog('Started request', 'INFO', ctx);
            return {
                willSendResponse: (resCtx) => {
                    if (resCtx.errors) {
                        for (const error of resCtx.errors) {
                            _handleLog(error, 'ERROR', resCtx);
                        }
                    }
                    else {
                        _handleLog('Finished request', 'INFO', resCtx);
                    }
                }
            };
        };
    }
}
exports.GcpApolloLoggerPlugin = GcpApolloLoggerPlugin;
//# sourceMappingURL=index.js.map