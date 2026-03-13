import {
	BadRequestException,
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	Req,
	UploadedFile,
	UseGuards,
	UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { Request } from 'express';
import {
	ApiBearerAuth,
	ApiBody,
	ApiConsumes,
	ApiCreatedResponse,
	ApiOkResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { ProductResponseDto } from './dto/product-response.dto';
import { UploadImageResponseDto } from './dto/upload-image-response.dto';
import { unlink } from 'fs/promises';

const ALLOWED_IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function ensureUploadDir(): string {
	const uploadDir = join(process.cwd(), 'uploads', 'products');
	if (!existsSync(uploadDir)) {
		mkdirSync(uploadDir, { recursive: true });
	}
	return uploadDir;
}

function createFilename(originalName: string): string {
	const extension = extname(originalName).toLowerCase();
	return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}${extension}`;
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
	constructor(private readonly productsService: ProductsService) {}

	@Post()
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create a new product (admin)' })
	@ApiCreatedResponse({ type: ProductResponseDto })
	create(@Body() createProductDto: CreateProductDto) {
		return this.productsService.create(createProductDto);
	}

	@Get()
	@ApiOperation({ summary: 'Get products with optional filters' })
	@ApiOkResponse({ type: ProductResponseDto, isArray: true })
	findAll(@Query() query: QueryProductsDto) {
		return this.productsService.findAll(query);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get product detail by id' })
	@ApiOkResponse({ type: ProductResponseDto })
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.findOne(id);
	}

	@Patch(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update product fields (admin)' })
	@ApiOkResponse({ type: ProductResponseDto })
	update(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateProductDto: UpdateProductDto,
	) {
		return this.productsService.update(id, updateProductDto);
	}

	@Delete(':id')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete product (admin)' })
	@HttpCode(HttpStatus.NO_CONTENT)
	remove(@Param('id', ParseIntPipe) id: number) {
		return this.productsService.remove(id);
	}

	@Post('upload-image')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Upload product image only (admin)' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				image: { type: 'string', format: 'binary' },
			},
			required: ['image'],
		},
	})
	@ApiCreatedResponse({ type: UploadImageResponseDto })
	@UseInterceptors(
		FileInterceptor('image', {
			storage: diskStorage({
				destination: (_req, _file, cb) => {
					cb(null, ensureUploadDir());
				},
				filename: (_req, file, cb) => {
					cb(null, createFilename(file.originalname));
				},
			}),
			limits: {
				fileSize: 5 * 1024 * 1024,
			},
			fileFilter: (_req, file, cb) => {
				const extension = extname(file.originalname).toLowerCase();
				if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
					cb(new BadRequestException('Only jpg, jpeg, png, webp are allowed'), false);
					return;
				}
				cb(null, true);
			},
		}),
	)
	uploadImage(@UploadedFile() file: { filename: string } | undefined, @Req() req: Request) {
		if (!file) {
			throw new BadRequestException('Image file is required');
		}

		const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;
		return {
			imageUrl,
		};
	}

	@Patch(':id/image')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Upload and bind image to product (admin)' })
	@ApiConsumes('multipart/form-data')
	@ApiBody({
		schema: {
			type: 'object',
			properties: {
				image: { type: 'string', format: 'binary' },
			},
			required: ['image'],
		},
	})
	@ApiOkResponse({ type: ProductResponseDto })
	@UseInterceptors(
		FileInterceptor('image', {
			storage: diskStorage({
				destination: (_req, _file, cb) => {
					cb(null, ensureUploadDir());
				},
				filename: (_req, file, cb) => {
					cb(null, createFilename(file.originalname));
				},
			}),
			limits: {
				fileSize: 5 * 1024 * 1024,
			},
			fileFilter: (_req, file, cb) => {
				const extension = extname(file.originalname).toLowerCase();
				if (!ALLOWED_IMAGE_EXTENSIONS.has(extension)) {
					cb(new BadRequestException('Only jpg, jpeg, png, webp are allowed'), false);
					return;
				}
				cb(null, true);
			},
		}),
	)
	async updateImage(
		@Param('id', ParseIntPipe) id: number,
		@UploadedFile() file: { filename: string } | undefined,
		@Req() req: Request,
	) {
		if (!file) {
			throw new BadRequestException('Image file is required');
		}

		const imageUrl = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;

		try {
			return await this.productsService.updateImage(id, imageUrl);
		} catch (error) {
			const uploadedPath = join(process.cwd(), 'uploads', 'products', file.filename);
			await unlink(uploadedPath).catch(() => undefined);
			throw error;
		}
	}
}
