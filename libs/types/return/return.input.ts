import { ReturnReason, ReturnStatus } from '../../enums/return.enum';
import { Direction } from '../../enums/common.enum';

export interface ReturnInput {
	orderItemId: string;
	returnQuantity: number;
	returnReason: ReturnReason;
	returnDesc?: string;
	returnImages?: string[];
}

interface RISearch {
	returnStatus?: ReturnStatus;
}

export interface ReturnsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: RISearch;
}

interface ALRISearch {
	returnStatus?: ReturnStatus;
	returnReason?: ReturnReason;
	memberId?: string;
	sellerId?: string;
}

export interface AllReturnsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: Direction;
	search: ALRISearch;
}
