export class CreateUserDto {
	email!: string
	username!: string
	password!: string

	nickname?: string
	bio?: string
	avatar?: string
}

/**email String @unique
  username String @unique
  password String

  nickname String?
  bio String?
  avatar String? */