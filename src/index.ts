import { ApolloServerPlugin, BaseContext } from 'apollo-server-plugin-base';
import { GcpLogger } from '@quantos/gcp-logger';

export class GcpApolloLoggerPlugin implements ApolloServerPlugin {

  requestDidStart = (ctx: BaseContext) => {

    if (ctx.request.operationName === 'IntrospectionQuery') { return {}; }

    let _log = `Started request ${ctx.request.query}`;
    if (ctx.request.variables) { _log += ' with variables ' + JSON.stringify(ctx.request.variables); }
    GcpLogger.log(_log, ctx.context.req, ctx.context.reqUser);

    return {
      willSendResponse: (resCtx: BaseContext) => {
        if (resCtx.errors) {
          GcpLogger.error(resCtx.errors[0], resCtx.context.req, resCtx.context.reqUser);
        }
        else {
          let _reslog = `Finished request ${resCtx.request.query}`;
          if (resCtx.request.variables) { _reslog += ' with variables ' + JSON.stringify(resCtx.request.variables); }
          GcpLogger.log(_reslog, resCtx.context.req, resCtx.context.reqUser);
        }
      }
    };
  }
}