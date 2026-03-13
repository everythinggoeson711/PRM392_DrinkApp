import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import {
	OrderStatus,
	UpdateOrderStatusDto,
} from './dto/update-order-status.dto';

export interface OrderItemResponse {
	id: number;
	productId: number | null;
	quantity: number;
	size: string | null;
	sugarLevel: string | null;
	iceLevel: string | null;
	toppings: string[];
	price: number;
}

export interface OrderResponse {
	id: number;
	userId: number | null;
	customerName: string;
	phone: string;
	address: string | null;
	totalAmount: number;
	status: string;
	createdAt: Date;
	items: OrderItemResponse[];
}

@Injectable()
export class OrdersService {
	constructor(
		private readonly dataSource: DataSource,
		@InjectRepository(Order)
		private readonly ordersRepository: Repository<Order>,
		@InjectRepository(Product)
		private readonly productsRepository: Repository<Product>,
		@InjectRepository(User)
		private readonly usersRepository: Repository<User>,
	) {}

	private toResponse(order: Order): OrderResponse {
		return {
			id: order.id,
			userId: order.user?.id ?? null,
			customerName: order.customerName,
			phone: order.phone,
			address: order.address ?? null,
			totalAmount: Number(order.totalAmount),
			status: order.status,
			createdAt: order.createdAt,
			items: (order.items ?? []).map((item) => ({
				id: item.id,
				productId: item.product?.id ?? null,
				quantity: item.quantity,
				size: item.size ?? null,
				sugarLevel: item.sugarLevel ?? null,
				iceLevel: item.iceLevel ?? null,
				toppings: item.toppings ?? [],
				price: Number(item.price),
			})),
		};
	}

	private assertStatusTransition(current: string, next: OrderStatus): void {
		const allowed: Record<string, OrderStatus[]> = {
			PENDING: ['PROCESSING', 'CANCELLED'],
			PROCESSING: ['COMPLETED', 'CANCELLED'],
			COMPLETED: [],
			CANCELLED: [],
		};

		if (current === next) {
			return;
		}

		if (!allowed[current]?.includes(next)) {
			throw new BadRequestException(
				`Invalid status transition: ${current} -> ${next}`,
			);
		}
	}

	async create(createOrderDto: CreateOrderDto): Promise<OrderResponse> {
		const productIds = createOrderDto.items.map((item) => item.productId);
		const uniqueProductIds = Array.from(new Set(productIds));
		const products = await this.productsRepository.find({
			where: { id: In(uniqueProductIds) },
		});

		if (products.length !== uniqueProductIds.length) {
			throw new NotFoundException('One or more products are not found');
		}

		const productMap = new Map(products.map((product) => [product.id, product]));
		const user = createOrderDto.userId
			? await this.usersRepository.findOne({ where: { id: createOrderDto.userId } })
			: null;

		if (createOrderDto.userId && !user) {
			throw new NotFoundException(`User #${createOrderDto.userId} not found`);
		}

		const savedOrder = await this.dataSource.transaction(async (manager) => {
			let totalAmount = 0;

			const order = manager.create(Order, {
				user,
				customerName: createOrderDto.customerName,
				phone: createOrderDto.phone,
				address: createOrderDto.address,
				status: 'PENDING',
				totalAmount: 0,
			});

			const createdOrder = await manager.save(order);
			const itemsToSave: OrderItem[] = [];

			for (const itemDto of createOrderDto.items) {
				const product = productMap.get(itemDto.productId);
				if (!product) {
					throw new NotFoundException(`Product #${itemDto.productId} not found`);
				}

				const linePrice = Number(product.price) * itemDto.quantity;
				totalAmount += linePrice;

				itemsToSave.push(
					manager.create(OrderItem, {
						order: createdOrder,
						product,
						quantity: itemDto.quantity,
						size: itemDto.size,
						sugarLevel: itemDto.sugarLevel,
						iceLevel: itemDto.iceLevel,
						toppings: itemDto.toppings,
						price: linePrice,
					}),
				);
			}

			if (itemsToSave.length) {
				await manager.save(itemsToSave);
			}

			createdOrder.totalAmount = Number(totalAmount.toFixed(2));
			await manager.save(createdOrder);

			return createdOrder;
		});

		const fullOrder = await this.ordersRepository.findOne({
			where: { id: savedOrder.id },
			relations: {
				user: true,
				items: {
					product: true,
				},
			},
		});

		if (!fullOrder) {
			throw new NotFoundException(`Order #${savedOrder.id} not found`);
		}

		return this.toResponse(fullOrder);
	}

	async findAll(userId?: number): Promise<OrderResponse[]> {
		const where = userId ? { user: { id: userId } } : undefined;

		const orders = await this.ordersRepository.find({
			where,
			relations: {
				user: true,
				items: {
					product: true,
				},
			},
			order: {
				id: 'DESC',
			},
		});

		return orders.map((order) => this.toResponse(order));
	}

	async findOne(id: number): Promise<OrderResponse> {
		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: {
				user: true,
				items: {
					product: true,
				},
			},
		});

		if (!order) {
			throw new NotFoundException(`Order #${id} not found`);
		}

		return this.toResponse(order);
	}

	async updateStatus(
		id: number,
		updateOrderStatusDto: UpdateOrderStatusDto,
	): Promise<OrderResponse> {
		const order = await this.ordersRepository.findOne({
			where: { id },
			relations: {
				user: true,
				items: {
					product: true,
				},
			},
		});

		if (!order) {
			throw new NotFoundException(`Order #${id} not found`);
		}

		this.assertStatusTransition(order.status, updateOrderStatusDto.status);
		order.status = updateOrderStatusDto.status;

		const saved = await this.ordersRepository.save(order);
		return this.toResponse(saved);
	}
}
