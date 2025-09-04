import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { Auth0Strategy } from './auth0.strategy';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'auth0' }),
    ConfigModule,
  ],
  providers: [Auth0Strategy],
  exports: [PassportModule],
})
export class Auth0Module {}