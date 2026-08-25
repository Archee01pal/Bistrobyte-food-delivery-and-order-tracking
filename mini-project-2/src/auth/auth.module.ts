import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    // Registers the standard NestJS passport engine
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: 'SUPER_SECRET_SIGNING_KEY_XYZ_123', // In production, move to an env file
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule, PassportModule],
})
export class AuthModule {}