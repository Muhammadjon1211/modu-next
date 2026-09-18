import { OrderStatus } from '../../enums/order.enum';
import { Direction } from '../../enums/common.enum';

export interface OrderItemInput {
	productId: string;
	itemQuantity: number;
}

interface OISearch {
	orderStatus?: OrderStatus;
}

export interface OrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: OISearch;
}

interface ALOISearch {
	orderStatus?: OrderStatus;
	memberId?: string;
}

export interface AllOrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALOISearch;
}
