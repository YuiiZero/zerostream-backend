import { FileUpload } from 'graphql-upload-ts'

export interface UploadWebpImageArguments {
	userId: string
	file: FileUpload
	uploadType: UploadType
}

export enum UploadType {
	AVATAR,
	THUMBNAIL
}
