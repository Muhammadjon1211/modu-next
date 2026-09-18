import { ReturnStatus } from '../../enums/return.enum';

export interface ReturnUpdate {
	_id: string;
	returnStatus: ReturnStatus;
	returnDesc?: string;
}
