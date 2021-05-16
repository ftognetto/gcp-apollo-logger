import { ApolloServerPlugin, BaseContext, GraphQLRequestContext, GraphQLRequestContextWillSendResponse } from 'apollo-server-plugin-base';
export declare const GcpApolloLogger: {
    log(log: Object | string, ctx?: GraphQLRequestContext, reqUser?: any): void;
    warn(log: Object | string | Error, ctx?: GraphQLRequestContext, reqUser?: any): void;
    error(log: Error, ctx?: GraphQLRequestContext, reqUser?: any): void;
    init(config: {
        extractUserFromContext: (ctx: GraphQLRequestContext) => any;
    }): void;
};
export declare class GcpApolloLoggerPlugin implements ApolloServerPlugin {
    requestDidStart: (ctx: GraphQLRequestContext) => {
        willSendResponse?: undefined;
    } | {
        willSendResponse: (resCtx: GraphQLRequestContextWillSendResponse<BaseContext>) => void;
    };
}
