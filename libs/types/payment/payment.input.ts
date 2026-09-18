import { PaymentType } from '../../enums/payment.enum';

/** the full number only travels to the server once; it is never kept on either side */
export interface PaymentInput {
	paymentType: PaymentType;
	holderName: string;
	cardNumber?: string;
	expMonth?: number;
	expYear?: number;
	bankName?: string;
	accountNumber?: string;
	isDefault?: boolean;
}
