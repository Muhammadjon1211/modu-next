import { OrderStatus } from '../../enums/order.enum';

export interface OrderUpdate {
	_id: string;
	orderStatus: OrderStatus;
}
