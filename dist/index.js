"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GcpApolloLoggerPlugin = void 0;
const gcp_logger_1 = require("@quantos/gcp-logger");
class GcpApolloLoggerPlugin {
    constructor() {
        this.requestDidStart = (ctx) => {
            if (ctx.request.operationName === 'IntrospectionQuery') {
                return {};
            }
            let _log = `Started request ${ctx.request.query}`;
            if (ctx.request.variables) {
                _log += ' with variables ' + JSON.stringify(ctx.request.variables);
            }
            gcp_logger_1.GcpLogger.log(_log, ctx.context.req, ctx.context.reqUser);
            return {
                willSendResponse: (resCtx) => {
                    if (resCtx.errors) {
                        gcp_logger_1.GcpLogger.error(resCtx.errors[0], resCtx.context.req, resCtx.context.reqUser);
                    }
                    else {
                        let _reslog = `Finished request ${resCtx.request.query}`;
                        if (resCtx.request.variables) {
                            _reslog += ' with variables ' + JSON.stringify(resCtx.request.variables);
                        }
                        gcp_logger_1.GcpLogger.log(_reslog, resCtx.context.req, resCtx.context.reqUser);
                    }
                }
            };
        };
    }
}
exports.GcpApolloLoggerPlugin = GcpApolloLoggerPlugin;
//# sourceMappingURL=index.js.map