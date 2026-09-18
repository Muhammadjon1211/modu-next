import { OrderStatus } from '../../enums/order.enum';
import { TotalCounter } from '../member/member';
import { Product } from '../product/product';

export interface OrderItem {
	_id: string;
	itemQuantity: number;
	itemPrice: number;
	itemDiscount: number;
	productId: string;
	sellerId: string;
	orderId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface Order {
	_id: string;
	orderStatus: OrderStatus;
	orderSubTotal: number;
	orderDelivery: number;
	orderTotal: number;
	memberId: string;
	purchasedAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	orderItems?: OrderItem[];
	productData?: Product[];
}

export interface Orders {
	list: Order[];
	metaCounter: TotalCounter[];
}
