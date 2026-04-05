// logger.module.ts

import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

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
            'req.headers["set-cookie"]',
            'req.body.password',
            'req.body.token',
            'req.body.accessToken',
            'req.body.refreshToken',
          ],
          remove: true,
        },

        // Crear / propagar requestId
        genReqId: (req, res) => {
          const headerId = req.id || req.headers['x-request-id'] || req.headers['x-correlation-id'];

          const id = String(headerId || randomUUID());
          res.setHeader('x-request-id', id);
          return id;
        },

        customProps: req => {
          const extReq = req as unknown as Record<string, unknown>;
          const user = extReq.user as Record<string, unknown> | undefined;
          const auth = extReq.auth as Record<string, unknown> | undefined;
          const session = extReq.session as Record<string, unknown> | undefined;
          const ctx = extReq.ctx as Record<string, Record<string, unknown>> | undefined;

          const userId = user?.id || auth?.userId || session?.userId || ctx?.user?.id;

          return {
            service: process.env.SERVICE_NAME || 'api',
            environment: process.env.NODE_ENV || 'development',
            requestId: extReq.id as string | undefined,
            userId: userId ?? null,
            ip: extReq.ip as string | undefined,
            method: extReq.method as string | undefined,
            path: extReq.url as string | undefined,
          };
        },

        autoLogging: {
          ignore: req => {
            const url = req.url || '';
            if (url === '/health' || url === '/') return true;
            const extReq = req as unknown as Record<string, unknown>;
            const body = extReq.body as Record<string, unknown> | undefined;
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
