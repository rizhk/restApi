import { Module, OnModuleInit } from '@nestjs/common';
import { UsersController } from './users.controller';
import { MongooseModule, InjectModel } from '@nestjs/mongoose';
import { UserSchema } from './schemas/user.schema';
import { UsersService } from './services/users/users.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/usersdb'),
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]), // Import user schema
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'users_queue',
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
})
export class UsersModule implements OnModuleInit {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async onModuleInit() {
    await this.initializeDatabase();
  }

  private async initializeDatabase() {
    // Check if the collection exists and create it if not
    const collections = await this.userModel.db.db.listCollections().toArray();
    const collectionNames = collections.map((col) => col.name);
    console.log(collectionNames);
    if (!collectionNames.includes('users')) {
      // Optionally, create the collection manually if needed
      await this.userModel.db.createCollection('users');
    }
  }
}
