import { PaymentType } from '../../enums/payment.enum';

export interface PaymentMethod {
	_id: string;
	paymentType: PaymentType;
	holderName: string;
	provider: string;
	last4: string;
	expMonth?: number;
	expYear?: number;
	isDefault: boolean;
	memberId: string;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrderPayment {
	paymentType: PaymentType;
	holderName: string;
	provider: string;
	last4: string;
}
