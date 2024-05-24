// users/services/users.service.ts

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema'; // Import the schema and document types
import { CreateUserDto } from '../../dtos'; // Import DTOs

import { ClientProxy } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';
import axios from 'axios';
import { OnModuleInit } from '@nestjs/common';

import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly uploadsDir = path.join(
    __dirname,
    '..',
    '..',
    '..',
    'uploads',
  );
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @Inject('RABBITMQ_SERVICE') private client: ClientProxy,
  ) {}

  onModuleInit() {
    this.ensureUploadsDirExists();
  }
  private ensureUploadsDirExists() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const createdUser = new this.userModel(createUserDto);
    await createdUser.save();
    this.client.emit('user_created', createdUser);
    console.log(`Sending email to ${createdUser.email}`);
    return createdUser;
  }

  async findById(userId: string): Promise<any> {
    const response = await axios.get(`https://reqres.in/api/users/${userId}`);
    return response.data.data;
  }

  async getAvatar(userId: string): Promise<string> {
    try {
      const user = await this.userModel.findOne({ userId: userId }).exec();

      if (user && user.avatar) {
        return user.avatar;
      }

      if (!user.avatar) {
        const response = await axios.get(
          `https://reqres.in/api/users/${userId}`,
        );
        const avatarUrl = response.data.data.avatar;
        const avatarResponse = await axios.get(avatarUrl, {
          responseType: 'arraybuffer',
        });

        const avatarData = Buffer.from(avatarResponse.data).toString('base64');

        // Save avatar to file system
        const avatarFilename = `${userId}.jpg`;
        const avatarFilePath = path.join(this.uploadsDir, avatarFilename);

        fs.writeFileSync(avatarFilePath, Buffer.from(avatarResponse.data));

        // Update user's avatar and save
        user.avatar = avatarData;

        await user.save();
      }

      return user.avatar;
    } catch (error) {
      console.log(error);
      throw new Error('Error retrieving avatar');
    }
  }

  async deleteAvatar(userId: string): Promise<void> {
    const user = await this.userModel.findOne({ userId: userId }).exec();

    const avatarFilename = `${userId}.jpg`;

    const avatarFilePath = path.join(this.uploadsDir, avatarFilename);

    // Check if the file exists before trying to delete it
    if (fs.existsSync(avatarFilePath)) {
      fs.unlinkSync(avatarFilePath);
    }

    user.avatar = undefined;
    await user.save();
  }
}
