import { Module } from '@nestjs/common';
import { ExchangesController } from './presentation/exchanges.controller';
import { CreateExchangeUseCase } from './application/create-exchange.use-case';
import { ListExchangesUseCase } from './application/list-exchanges.use-case';
import { UpdateExchangeUseCase } from './application/update-exchange.use-case';
import { GetExchangeUseCase } from './application/get-exchange.use-case';
import { PrismaExchangeRepository } from './infrastructure/prisma-exchange-repository';
import { EXCHANGE_REPOSITORY_TOKEN } from './domain/tokens';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ExchangesController],
  providers: [
    CreateExchangeUseCase,
    ListExchangesUseCase,
    UpdateExchangeUseCase,
    GetExchangeUseCase,
    {
      provide: EXCHANGE_REPOSITORY_TOKEN,
      useClass: PrismaExchangeRepository,
    },
    {
      provide: 'ExchangeRepositoryPort',
      useExisting: EXCHANGE_REPOSITORY_TOKEN,
    },
  ],
  exports: ['ExchangeRepositoryPort'],
})
export class ExchangesModule {}
