import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../common/entities/base.entity';
import { Order } from './order.entity';
import { Product } from './product.entity';

@Entity('order_items')
export class OrderItem extends AbstractBaseEntity {
  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order: Order;

  @ApiProperty({ example: 'order-uuid' })
  @Column()
  orderId: string;

  @ManyToOne(() => Product, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @ApiProperty({ example: 'product-uuid' })
  @Column({ nullable: true })
  productId: string;

  @ApiProperty({ example: 2 })
  @Column({ type: 'int', default: 1 })
  quantity: number;

  @ApiProperty({ example: 20000 })
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;
}
