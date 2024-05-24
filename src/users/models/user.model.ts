import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schemas/user.schema'; // Import the schema and document types

@Injectable()
export class UserModel {
  constructor(
    @InjectModel(User.name) private readonly userDocument: Model<UserDocument>,
  ) {}

  async create(user: User): Promise<User> {
    const createdUser = new this.userDocument(user);
    return await createdUser.save();
  }

  async findAll(): Promise<User[]> {
    return await this.userDocument.find().exec();
  }

  async findOneById(userId: string): Promise<User> {
    return await this.userDocument.findById({ userId }).exec();
  }

  async update(userId: string, user: User): Promise<User> {
    return await this.userDocument
      .findByIdAndUpdate({ userId }, user, { new: true })
      .exec();
  }

  async remove(userId: string): Promise<User> {
    return await this.userDocument.findByIdAndDelete({ userId }).exec();
  }
}
