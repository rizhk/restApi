import * as request from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './services/users/users.service';
import { CreateUserDto } from './dtos';
import { INestApplication } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';

describe('UsersController', () => {
  let app: INestApplication;
  let usersService: UsersService;
  let usersController: UsersController;
  let apiUrl: string;
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(), // Mock the create method
            findById: jest.fn(),
            getAvatar: jest.fn(),
            deleteAvatar: jest.fn(),
          },
        },
      ],
    }).compile();
    app = moduleFixture.createNestApplication();
    await app.init();
    usersController = moduleFixture.get<UsersController>(UsersController, {
      strict: false,
    });
    usersService = moduleFixture.get<UsersService>(UsersService);
  });

  describe('POST /api/users', () => {
    it('should create a new user', async () => {
      const createUserDto: CreateUserDto = {
        name: 'rizwan',
        email: 'email1@email.com',
        userId: '1',
      };
      debugger;
      const createdUser = {
        name: 'rizwan',
        email: 'email1@email.com',
        userId: '1',
        _id: '664e248d1e29a978fb1af65d',
        __v: 0,
      };

      const response = await request(app.getHttpServer())
        .post('/api/users')
        .send(createUserDto)
        .expect(201);

      let body = response.body;
      let text = response.text;
      console.log('body', body);

      expect(response.body).toEqual(createdUser);
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('should create a user', async () => {
    const createUserDto = {
      name: 'rizwan',
      email: 'email1@email.com',
      userId: '1',
    };

    const createdUser = {
      name: 'rizwan',
      email: 'email1@email.com',
      userId: '1',
      _id: '664e248d1e29a978fb1af65d',
      __v: 0,
    };

    const response = await request(app.getHttpServer())
      .post('/api/users')
      .send(createUserDto)
      .expect(201);

    expect(response.body).toEqual(createdUser);
  });

  it('should get avatar', async () => {
    const userId = '1';
    const avatar = 'some-avatar';

    const response = await request(app.getHttpServer())
      .get(`/api/users/${userId}/avatar`)
      .expect(200);

    expect(response.body).toEqual({ avatar });
  });

  // it('should delete avatar', async () => {
  //   const userId = '1';

  //   await request(app.getHttpServer())
  //     .delete(`/api/users/${userId}/avatar`)
  //     .expect(200);

  //   expect(usersService.deleteAvatar).toHaveBeenCalledWith(userId);
  // });
});
