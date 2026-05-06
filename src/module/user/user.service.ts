import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../../core/module/prisma/prisma.service';

@Injectable()
export class UserService {
	constructor(private prismaService: PrismaService) {}

	async create(createUserDto: CreateUserDto) {
		const user = await this.prismaService.user.create({
			data: createUserDto,
			omit: {
				createdAt: true,
				updatedAt: true
			}
		})

		if (!user) {
			throw new InternalServerErrorException('Could not create user')
		}

		return true;
	}

	findAll() {
		return this.prismaService.user.findMany({
			omit: {
				createdAt: true,
				updatedAt: true
			}
		});
	}

	async findOne(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			},
			omit: {
				createdAt: true,
				updatedAt: true
			}
		})
		return user;
	}

	async update(id: string, updateUserDto: UpdateUserDto) {
		await this.prismaService.user.update({
			where: { id },
			data: updateUserDto
		})

		return true;
	}

	async remove(id: string) {
		await this.prismaService.user.delete({ where: { id } })
		return true
	}
}
