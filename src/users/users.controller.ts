import { ThrottlerGuard } from '@nestjs/throttler';
import { LoggingInterceptor } from './../interceptors/logging. interceptor';
import { UpdatePutUserDTO } from './dto/update-put-user.dto';
import { UpdatePartialUserDTO } from './dto/update-partial-user.dto';
import { CreateUserDTO } from './dto/create-user.dto';
import { UsersService } from './users.service';
import {
  Body,
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Put,
  UseInterceptors,
  UseGuards,
} from '@nestjs/common';
import { ParamId } from 'src/decorators/param-id.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RoleGuards } from 'src/guards/role.guards';
import { AuthGuards } from 'src/guards/auth.guards';

@UseGuards(AuthGuards, RoleGuards)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(ThrottlerGuard)
  @Roles(Role.Admin)
  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @UseInterceptors(LoggingInterceptor)
  @Post('create')
  async create(@Body() databody: CreateUserDTO): Promise<any> {
    return this.usersService.create(databody);
  }

  @Roles(Role.Admin, Role.User)
  @Get(':id')
  async showOne(@ParamId() id: number) {
    return this.usersService.show(id);
  }

  @Roles(Role.Admin)
  @Patch('upd-partial/:id')
  async updatePartial(
    @ParamId() id: number,
    @Body() data: UpdatePartialUserDTO,
  ): Promise<any> {
    return this.usersService.updatePartial(id, data);
  }

  @Roles(Role.Admin)
  @Put('update/:id')
  async update(@ParamId() id: number, @Body() data: UpdatePutUserDTO) {
    return this.usersService.update(id, data);
  }

  @Roles(Role.Admin)
  @Delete('delete/:id')
  async destroy(@ParamId() id: number) {
    return `id - ${id} destroyed`;
  }
}
