import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../categories/entities/category.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { QueryProductsDto } from './dto/query-products.dto';
import { join, normalize } from 'path';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';

export interface ProductResponse {
	id: number;
	name: string;
	price: number;
	imageUrl: string | null;
	categoryId: number | null;
}

@Injectable()
export class ProductsService {
	constructor(
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
		@InjectRepository(Category)
		private readonly categoriesRepository: Repository<Category>,
	) {}

	private toResponse(product: Product): ProductResponse {
		return {
			id: product.id,
			name: product.name,
			price: Number(product.price),
			imageUrl: product.image_url ?? null,
			categoryId: product.category?.id ?? null,
		};
	}

	private resolveLocalUploadPath(imageUrl: string): string | null {
		let pathname = imageUrl;

		try {
			pathname = new URL(imageUrl).pathname;
		} catch {
			pathname = imageUrl;
		}

		if (!pathname.startsWith('/uploads/')) {
			return null;
		}

		const uploadsRoot = normalize(join(process.cwd(), 'uploads'));
		const relativePath = pathname.replace(/^\/+/, '');
		const absolutePath = normalize(join(process.cwd(), relativePath));

		if (!absolutePath.startsWith(uploadsRoot)) {
			return null;
		}

		return absolutePath;
	}

	private async deleteLocalImageByUrl(imageUrl: string | null | undefined): Promise<void> {
		if (!imageUrl) {
			return;
		}

		const imagePath = this.resolveLocalUploadPath(imageUrl);
		if (!imagePath) {
			return;
		}

		if (existsSync(imagePath)) {
			await unlink(imagePath);
		}
	}

	private async findCategoryOrFail(categoryId: number): Promise<Category> {
		const category = await this.categoriesRepository.findOne({
			where: { id: categoryId },
		});
		if (!category) {
			throw new NotFoundException(`Category #${categoryId} not found`);
		}
		return category;
	}

	async create(createProductDto: CreateProductDto): Promise<ProductResponse> {
		const category = await this.findCategoryOrFail(createProductDto.categoryId);
		const product = this.productsRepository.create({
			name: createProductDto.name,
			price: createProductDto.price,
			image_url: createProductDto.imageUrl,
			category,
		});

		const saved = await this.productsRepository.save(product);
		const full = await this.productsRepository.findOne({
			where: { id: saved.id },
			relations: { category: true },
		});

		if (!full) {
			throw new NotFoundException('Created product cannot be loaded');
		}
		return this.toResponse(full);
	}

	async findAll(query: QueryProductsDto): Promise<ProductResponse[]> {
		const qb = this.productsRepository
			.createQueryBuilder('product')
			.leftJoinAndSelect('product.category', 'category')
			.orderBy('product.id', 'ASC');

		if (query.q) {
			qb.andWhere('product.name ILIKE :keyword', {
				keyword: `%${query.q}%`,
			});
		}

		if (query.categoryId) {
			qb.andWhere('category.id = :categoryId', {
				categoryId: query.categoryId,
			});
		}

		const products = await qb.getMany();

		return products.map((product) => this.toResponse(product));
	}

	async findOne(id: number): Promise<ProductResponse> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: { category: true },
		});
		if (!product) {
			throw new NotFoundException(`Product #${id} not found`);
		}
		return this.toResponse(product);
	}

	async update(id: number, updateProductDto: UpdateProductDto): Promise<ProductResponse> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: { category: true },
		});
		if (!product) {
			throw new NotFoundException(`Product #${id} not found`);
		}

		const oldImageUrl = product.image_url;

		if (updateProductDto.categoryId) {
			product.category = await this.findCategoryOrFail(updateProductDto.categoryId);
		}

		if (typeof updateProductDto.name !== 'undefined') {
			product.name = updateProductDto.name;
		}

		if (typeof updateProductDto.price !== 'undefined') {
			product.price = updateProductDto.price;
		}

		if (typeof updateProductDto.imageUrl !== 'undefined') {
			product.image_url = updateProductDto.imageUrl;
		}

		const saved = await this.productsRepository.save(product);

		if (
			typeof updateProductDto.imageUrl !== 'undefined' &&
			oldImageUrl &&
			oldImageUrl !== updateProductDto.imageUrl
		) {
			await this.deleteLocalImageByUrl(oldImageUrl);
		}

		return this.toResponse(saved);
	}

	async remove(id: number): Promise<void> {
		const product = await this.productsRepository.findOne({ where: { id } });
		if (!product) {
			throw new NotFoundException(`Product #${id} not found`);
		}
		const imageUrl = product.image_url;
		await this.productsRepository.remove(product);
		await this.deleteLocalImageByUrl(imageUrl);
	}

	async updateImage(id: number, imageUrl: string): Promise<ProductResponse> {
		const product = await this.productsRepository.findOne({
			where: { id },
			relations: { category: true },
		});
		if (!product) {
			throw new NotFoundException(`Product #${id} not found`);
		}

		const oldImageUrl = product.image_url;
		product.image_url = imageUrl;
		const saved = await this.productsRepository.save(product);

		if (oldImageUrl && oldImageUrl !== imageUrl) {
			await this.deleteLocalImageByUrl(oldImageUrl);
		}

		return this.toResponse(saved);
	}
}
