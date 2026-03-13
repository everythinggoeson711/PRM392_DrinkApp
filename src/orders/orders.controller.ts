import {
	Body,
	Controller,
	Get,
	Param,
	ParseIntPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
export class OrdersController {
	constructor(private readonly ordersService: OrdersService) {}

	@Post()
	create(@Body() createOrderDto: CreateOrderDto) {
		return this.ordersService.create(createOrderDto);
	}

	@Get()
	findAll(@Query('userId') userId?: string) {
		const parsedUserId = userId ? Number(userId) : undefined;
		return this.ordersService.findAll(parsedUserId);
	}

	@Get(':id')
	findOne(@Param('id', ParseIntPipe) id: number) {
		return this.ordersService.findOne(id);
	}

	@Patch(':id/status')
	@UseGuards(JwtAuthGuard, RolesGuard)
	@Roles('admin')
	updateStatus(
		@Param('id', ParseIntPipe) id: number,
		@Body() updateOrderStatusDto: UpdateOrderStatusDto,
	) {
		return this.ordersService.updateStatus(id, updateOrderStatusDto);
	}
}
