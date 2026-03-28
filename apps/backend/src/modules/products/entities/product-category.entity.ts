import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { AbstractBaseEntity } from '../../../common/entities/base.entity';
import { Business } from '../../businesses/entities/business.entity';
import { Branch } from '../../branches/entities/branch.entity';
import { Product } from './product.entity';

@Entity('product_categories')
export class ProductCategory extends AbstractBaseEntity {
  @ApiProperty({ example: 'Food' })
  @Column()
  name: string;

  @ManyToOne(() => Business, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'businessId' })
  business: Business;

  @ApiProperty({ example: 'business-uuid' })
  @Column()
  businessId: string;

  @ManyToOne(() => Branch, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'branchId' })
  branch: Branch;

  @ApiProperty({ example: 'branch-uuid' })
  @Column()
  branchId: string;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
