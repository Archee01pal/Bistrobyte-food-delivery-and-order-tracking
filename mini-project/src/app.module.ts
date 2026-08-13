import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { OffersModule } from './offers/offers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';

@Module({
  imports: [
    // 🔌 Connects NestJS to your downloaded local PostgreSQL server
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'Archeepal@00', 
      database: 'postgres',
      autoLoadEntities: true, // Automatically registers your tables
      synchronize: true,      // Automatically updates SQL tables based on your code (Great for local dev!)
    }),
    UsersModule,
    ProductsModule,
  ],
})
export class AppModule {}