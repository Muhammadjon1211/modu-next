import { OrderStatus } from '../../enums/order.enum';
import { ProductColor, ProductSize } from '../../enums/product.enum';
import { AddressInput } from '../address/address.input';
import { PaymentInput } from '../payment/payment.input';
import { Direction } from '../../enums/common.enum';

export interface OrderItemInput {
	productId: string;
	itemQuantity: number;
	itemSize?: ProductSize;
	itemColor?: ProductColor;
}

export interface CartItemUpdate {
	orderItemId: string;
	itemQuantity: number;
}

/** checkout — a saved address / method by id, or a new one that can be saved */
export interface OrderInput {
	addressId?: string;
	shipping?: AddressInput;
	saveAddress?: boolean;
	paymentMethodId?: string;
	payment?: PaymentInput;
	savePayment?: boolean;
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
	sellerId?: string;
}

export interface AllOrdersInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALOISearch;
}

interface SCSearch {
	sellerId: string;
}

export interface StoreCustomersInquiry {
	page: number;
	limit: number;
	search: SCSearch;
}
