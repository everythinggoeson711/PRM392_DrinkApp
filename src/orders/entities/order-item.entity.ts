import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column()
  quantity: number;

  @Column({ nullable: true })
  size: string; // S, M, L

  @Column({ name: 'sugar_level', nullable: true })
  sugarLevel: string; // 100%, 70%, 50%, 30%, 0%

  @Column({ name: 'ice_level', nullable: true })
  iceLevel: string; // 100%, 70%, 50%, 0%

  @Column('simple-array', { nullable: true })
  toppings: string[];

  @Column('decimal')
  price: number;
}