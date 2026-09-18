import { OrderStatus } from '../../enums/order.enum';
import { Member, TotalCounter } from '../member/member';
import { Product } from '../product/product';
import { OrderShipping } from '../address/address';
import { OrderPayment } from '../payment/payment';

export interface OrderItem {
	_id: string;
	itemQuantity: number;
	itemPrice: number;
	itemDiscount: number;
	itemSize?: string;
	itemColor?: string;
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
	orderShipping?: OrderShipping;
	orderPayment?: OrderPayment;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	orderItems?: OrderItem[];
	productData?: Product[];
	memberData?: Member;
}

export interface Orders {
	list: Order[];
	metaCounter: TotalCounter[];
}

export interface StoreCustomer {
	_id: string;
	orderCount: number;
	unitsBought: number;
	totalSpent: number;
	lastOrderAt?: Date;
	/** from aggregation **/
	memberData?: Member;
}

export interface StoreCustomers {
	list: StoreCustomer[];
	metaCounter: TotalCounter[];
}

export interface StoreSummary {
	orderCount: number;
	unitsSold: number;
	grossSales: number;
	customerCount: number;
}
