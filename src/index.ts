import winston from 'winston';
import { LoggingWinston } from '@google-cloud/logging-winston';
import { GraphQLError, GraphQLFormattedError } from 'graphql';
import { ApolloError, Context } from 'apollo-server-core';

let loggingWinston: LoggingWinston;
let logger: winston.Logger;

const _initLogger = () => {

  // serviceContext se è valorizzato riporta gli errori anche su Error Reporting
  const serviceContext = process.env.SERVICE_NAME ? { service: process.env.SERVICE_NAME } : undefined;

  loggingWinston = new LoggingWinston({
    serviceContext
  });

  // Transports - se in debug scriviamo anche nella console
  const transports: winston.transport[] = [];
  if (process.env.NODE_ENV === 'development') { transports.push(new winston.transports.Console()); }
  transports.push(loggingWinston);

  logger = winston.createLogger({
    level: 'info',
    transports
  });
};

// Metodo principale
// Formatta e scrive i log
const _handleLog = (severity: 'ERROR' | 'WARNING' | 'INFO', message: string, error?: Error)  => {


  if (!logger) { _initLogger(); }

  switch (severity) {
    case 'ERROR': logger.error(message, error || new Error(message)); break;
    case 'WARNING': logger.warn(message, error || new Error(message)); break;
    default: logger.info(message + ' - ' + error ? JSON.stringify(error) : ''); break;
  }
  
};

export const GcpApolloLogger = {
    formatError: (error: GraphQLError): GraphQLFormattedError<Record<string, any>> => {
        if (error.originalError instanceof ApolloError) {
            _handleLog('WARNING', error.message, error.originalError); // faccio un warn perchè Apollo error corrisponde a un 4xx error (utente)
            return error;
        }
        else {
            _handleLog('ERROR', error.message, error.originalError);
            return process.env.NODE_ENV === 'production' ? { message: 'Internal Server Error' } : error;
        }
    }
}