import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: process.env.LOG_LEVEL || 'info',
        transport:
          process.env.NODE_ENV !== 'production'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'yyyy-mm-dd HH:MM:ss',
                  ignore: 'pid,hostname',
                  singleLine: true,
                  messageFormat: '{levelLabel} | {msg}',
                  levelFirst: false,
                },
              }
            : undefined,
        customProps: (req) => ({
          userId: (req as any).user?.id,
          context: 'HTTP',
        }),
        autoLogging: {
          ignore: (req) => req.url === '/health' || req.url === '/',
        },
      },
    }),
  ],
  exports: [PinoLoggerModule],
})
export class LoggerModule {}
