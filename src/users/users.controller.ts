import { Controller, Post, Body, Get, Param, Delete } from '@nestjs/common';
import { CreateUserDto } from './dtos'; // Import DTOs
import { UsersService } from './services/users/users.service';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':userId')
  async findById(@Param('userId') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get(':userId/avatar')
  async getAvatar(@Param('userId') userId: string) {
    const avatarData = await this.usersService.getAvatar(userId);
    return { data: avatarData };
  }

  @Delete(':userId/avatar')
  async deleteAvatar(@Param('userId') userId: string) {
    await this.usersService.deleteAvatar(userId);
  }
}
