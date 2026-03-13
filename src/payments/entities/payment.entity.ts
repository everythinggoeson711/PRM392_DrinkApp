import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Order } from '../../orders/entities/order.entity';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Order, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  /** Unique content embedded in the bank transfer, e.g. DRK1 */
  @Column({ name: 'payment_code', unique: true })
  paymentCode: string;

  @Column('decimal')
  amount: number;

  @Column({ default: 'PENDING' })
  status: PaymentStatus;

  @Column({ name: 'qr_url', type: 'text', nullable: true })
  qrUrl: string | null;

  @Column({ name: 'sepay_transaction_id', type: 'varchar', nullable: true })
  sepayTransactionId: string | null;

  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
