import { UpdatePartialUserDTO } from './dto/update-partial-user.dto';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<any> {
    return this.prisma.user.findMany();
  }

  async create(data: CreateUserDTO): Promise<any> {
    data.password = await bcrypt.hash(data.password, await bcrypt.genSalt());

    return this.prisma.user.create({
      data,
    });
  }

  async show(id: number): Promise<any> {
    await this.exists(id);

    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async update(id: number, databody: UpdatePutUserDTO): Promise<any> {
    const { name, email, role } = databody;

    databody.password = await bcrypt.hash(
      databody.password,
      await bcrypt.genSalt(),
    );

    const password = databody.password;

    return this.prisma.user.update({
      data: {
        name,
        email,
        password,
        role,
      },
      where: {
        id,
      },
    });
  }

  async updatePartial(
    id: number,
    { name, email, password, role }: UpdatePartialUserDTO,
  ): Promise<User> {
    // const data: any =
    await this.exists(id);

    const data: any = {};

    // if (birthAt) {
    //   data.birthAt = new Date(birthAt)
    // }

    if (email) {
      data.email = email;
    }

    if (name) {
      data.name = name;
    }

    if (password) {
      data.password = await bcrypt.hash(password, await bcrypt.genSalt());
    }

    if (role) {
      data.role = role;
    }

    return this.prisma.user.update({ where: { id }, data });
  }

  async exists(id: number) {
    if (
      !(await this.prisma.user.count({
        where: { id },
      }))
    )
      throw new NotFoundException(`User with id ${id} not found`);
  }
}
