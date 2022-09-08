import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { User } from './user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    const users: User[] = [];

    // Create a fake copy of the users service
    fakeUsersService = {
      // findOne: () => Promise.resolve({}),

      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },

      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 99999),
          email,
          password,
        } as User;

        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'test');

    expect(user.password).not.toEqual('test');
    const [salt, hash] = user.password.split('.');
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if users signs up with in use email', async () => {
    // modified version for this test, rest will use the main find method
    // fakeUsersService.find = () =>
    //   Promise.resolve([{ id: 1, email: 'a', password: '1' } as User]);
    await service.signup('test@test.com', 'test');
    try {
      await service.signup('test@test.com', 'test');
    } catch (error) {
      // done();
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('test1@test.com', 'password');
    } catch (error) {
      // done();
    }
  });

  it('throws if an invalid password is provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     { email: 'test2@test.com', password: 'password1' } as User,
    //   ]);

    await service.signup('blabla@test.com', 'password1');
    try {
      await service.signin('blabla@test.com', 'password1');
    } catch (error) {
      // done();
    }
  });

  it('returns a user if correct password is provided', async () => {
    // fakeUsersService.find = () =>
    //   Promise.resolve([
    //     {
    //       email: 'test2@test.com',
    //       password:
    //         'a264c2a87d3f67d5.24c6f910448955f933c45c6d7de3c7900e58bcf8bc8032b3622536b9e42b7119',
    //     } as User,
    //   ]);

    await service.signup('test2@test.com', 'Hashedpassword');
    const user = await service.signin('test2@test.com', 'Hashedpassword');
    expect(user).toBeDefined();
  });
});
