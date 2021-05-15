import { ApolloServerPlugin, BaseContext } from 'apollo-server-plugin-base';
export declare class GcpApolloLoggerPlugin implements ApolloServerPlugin {
    requestDidStart: (ctx: BaseContext) => {
        willSendResponse?: undefined;
    } | {
        willSendResponse: (resCtx: BaseContext) => void;
    };
}
