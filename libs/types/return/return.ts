import { ReturnReason, ReturnStatus } from '../../enums/return.enum';
import { Member, TotalCounter } from '../member/member';
import { Product } from '../product/product';

export interface Return {
	_id: string;
	returnStatus: ReturnStatus;
	returnReason: ReturnReason;
	returnDesc?: string;
	returnImages?: string[];
	returnQuantity: number;
	returnAmount: number;
	memberId: string;
	sellerId: string;
	orderId: string;
	orderItemId: string;
	productId: string;
	approvedAt?: Date;
	rejectedAt?: Date;
	completedAt?: Date;
	cancelledAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	memberData?: Member;
	productData?: Product;
}

export interface Returns {
	list: Return[];
	metaCounter: TotalCounter[];
}

export interface ReturnEligibility {
	eligible: boolean;
	quantityReturnable: number;
	windowClosesAt?: Date;
	reason?: string;
}
