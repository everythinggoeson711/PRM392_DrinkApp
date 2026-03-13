import { IsIn } from 'class-validator';

export const ORDER_STATUS_VALUES = [
  'PENDING',
  'PROCESSING',
  'COMPLETED',
  'CANCELLED',
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export class UpdateOrderStatusDto {
  @IsIn(ORDER_STATUS_VALUES)
  status: OrderStatus;
}
