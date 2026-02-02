// logger.module.ts
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';
import { randomUUID } from 'node:crypto';

const isProd = process.env.NODE_ENV === 'production';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || (isProd ? 'info' : 'debug'),

        transport: !isProd
          ? {
              target: 'pino-pretty',
              options: {
                colorize: true,
                translateTime: 'yyyy-mm-dd HH:MM:ss',
                ignore: 'pid,hostname,req,res,service,environment,requestId,ip,method,path',
                singleLine: false,
                messageFormat: '{if context}[{context}]{end} {msg}',
                levelFirst: false,
              },
            }
          : undefined,

        // Redactar datos sensibles SIEMPRE
        redact: {
          paths: [
            'req.headers.authorization',
            'req.headers.cookie',
            'req.headers[\"set-cookie\"]',
            'req.body.password',
            'req.body.token',
            'req.body.accessToken',
            'req.body.refreshToken',
          ],
          remove: true,
        },

        // Crear / propagar requestId
        genReqId: (req, res) => {
          const headerId =
            req.id ||
            req.headers['x-request-id'] ||
            req.headers['x-correlation-id'];

          const id = String(headerId || randomUUID());
          res.setHeader('x-request-id', id);
          return id;
        },

        customProps: (req) => {
          const anyReq = req as any;

          // Intenta sacar userId desde distintos sitios (rest, graphql, better-auth)
          const userId =
            anyReq.user?.id ||
            anyReq.auth?.userId ||
            anyReq.session?.userId ||
            anyReq.ctx?.user?.id;

          return {
            service: process.env.SERVICE_NAME || 'api',
            environment: process.env.NODE_ENV || 'development',
            requestId: anyReq.id,
            userId: userId ?? null,
            ip: anyReq.ip,
            method: anyReq.method,
            path: anyReq.url,
          };
        },

        autoLogging: {
          ignore: (req) => {
            const url = req.url || '';
            if (url === '/health' || url === '/') return true;
            // Ignorar introspección de GraphQL
            const body = (req as any).body;
            if (url === '/graphql' && body?.operationName === 'IntrospectionQuery') {
              return true;
            }
            return false;
          },
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
