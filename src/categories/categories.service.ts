import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
	constructor(
		@InjectRepository(Category)
		private readonly categoriesRepository: Repository<Category>,
	) {}

	async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
		const existing = await this.categoriesRepository.findOne({
			where: { name: createCategoryDto.name },
		});
		if (existing) {
			throw new ConflictException('Category name already exists');
		}

		const category = this.categoriesRepository.create(createCategoryDto);
		return this.categoriesRepository.save(category);
	}

	findAll(): Promise<Category[]> {
		return this.categoriesRepository.find({
			order: { id: 'ASC' },
		});
	}

	async findOne(id: number): Promise<Category> {
		const category = await this.categoriesRepository.findOne({ where: { id } });
		if (!category) {
			throw new NotFoundException(`Category #${id} not found`);
		}
		return category;
	}

	async update(id: number, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
		const category = await this.findOne(id);

		if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
			const existing = await this.categoriesRepository.findOne({
				where: { name: updateCategoryDto.name },
			});
			if (existing) {
				throw new ConflictException('Category name already exists');
			}
		}

		const updated = this.categoriesRepository.merge(category, updateCategoryDto);
		return this.categoriesRepository.save(updated);
	}

	async remove(id: number): Promise<void> {
		const category = await this.findOne(id);
		await this.categoriesRepository.remove(category);
	}
}
