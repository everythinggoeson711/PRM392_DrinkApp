import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items)
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  size: string; // S, M, L

  @Column({ nullable: true })
  sugarLevel: string; // 100%, 70%, 50%, 30%, 0%

  @Column({ nullable: true })
  iceLevel: string; // 100%, 70%, 50%, 0%

  @Column('simple-array', { nullable: true })
  toppings: string[];

  @Column('decimal')
  price: number;
}