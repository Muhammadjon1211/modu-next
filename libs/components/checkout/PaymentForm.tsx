import React from 'react';
import { useTranslation } from 'next-i18next';
import { InputAdornment, Stack, TextField } from '@mui/material';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import { PaymentType } from '../../enums/payment.enum';
import { PaymentInput } from '../../types/payment/payment.input';

/** what the form holds — the expiry is typed as MM/YY and split only when sending */
export interface PaymentFormValue {
	paymentType: PaymentType;
	holderName: string;
	cardNumber: string;
	expiry: string;
	bankName: string;
	accountNumber: string;
}

export const emptyPayment: PaymentFormValue = {
	paymentType: PaymentType.CARD,
	holderName: '',
	cardNumber: '',
	expiry: '',
	bankName: '',
	accountNumber: '',
};

const digitsOf = (value: string) => value.replace(/\D/g, '');

const passesLuhn = (digits: string): boolean => {
	let sum = 0;
	for (let i = 0; i < digits.length; i++) {
		let n = Number(digits[digits.length - 1 - i]);
		if (i % 2 === 1) {
			n *= 2;
			if (n > 9) n -= 9;
		}
		sum += n;
	}
	return sum % 10 === 0;
};

export const cardBrandOf = (digits: string): string => {
	if (/^9860/.test(digits)) return 'HUMO';
	if (/^8600/.test(digits)) return 'UZCARD';
	if (/^4/.test(digits)) return 'VISA';
	if (/^(5[1-5]|2(2[2-9]|[3-6]\d|7[01]|720))/.test(digits)) return 'MASTERCARD';
	if (/^3[47]/.test(digits)) return 'AMEX';
	if (/^35/.test(digits)) return 'JCB';
	if (/^62/.test(digits)) return 'UNIONPAY';
	return '';
};

/** same rules the server applies; the server stays the authority */
export const paymentProblem = (value: PaymentFormValue): string => {
	if (value.holderName.trim().length < 2) return 'Enter the name on the account';
	if (value.paymentType === PaymentType.CARD) {
		const digits = digitsOf(value.cardNumber);
		if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) return 'Card number is not valid!';
		const [mm, yy] = value.expiry.split('/').map((ele) => Number(ele));
		if (!mm || mm > 12 || yy === undefined || Number.isNaN(yy)) return 'Enter the expiry as MM/YY';
		const end = new Date(2000 + yy, mm, 0, 23, 59, 59);
		if (end < new Date()) return 'This card has expired!';
		return '';
	}
	if (value.bankName.trim().length < 2) return 'Enter the bank name';
	const account = digitsOf(value.accountNumber);
	if (account.length < 6 || account.length > 20) return 'Account number is not valid!';
	return '';
};

export const toPaymentInput = (value: PaymentFormValue): PaymentInput => {
	if (value.paymentType === PaymentType.CARD) {
		const [mm, yy] = value.expiry.split('/').map((ele) => Number(ele));
		return {
			paymentType: PaymentType.CARD,
			holderName: value.holderName.trim(),
			cardNumber: digitsOf(value.cardNumber),
			expMonth: mm,
			expYear: 2000 + yy,
		};
	}
	return {
		paymentType: PaymentType.BANK,
		holderName: value.holderName.trim(),
		bankName: value.bankName.trim(),
		accountNumber: digitsOf(value.accountNumber),
	};
};

interface PaymentFormType {
	value: PaymentFormValue;
	onChange: (value: PaymentFormValue) => void;
}

const PaymentForm = (props: PaymentFormType) => {
	const { value, onChange } = props;
	const { t } = useTranslation('common');
	const isCard = value.paymentType === PaymentType.CARD;
	const brand = cardBrandOf(digitsOf(value.cardNumber));

	/** HANDLERS **/
	const set = (name: keyof PaymentFormValue, next: string) => onChange({ ...value, [name]: next });

	const cardNumberHandler = (raw: string) => {
		const digits = digitsOf(raw).slice(0, 19);
		set('cardNumber', digits.replace(/(\d{4})(?=\d)/g, '$1 '));
	};

	const expiryHandler = (raw: string) => {
		const digits = digitsOf(raw).slice(0, 4);
		set('expiry', digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
	};

	return (
		<Stack className={'payment-form'}>
			<Stack className={'pay-type'}>
				<button
					type={'button'}
					className={isCard ? 'active' : ''}
					onClick={() => onChange({ ...value, paymentType: PaymentType.CARD })}
				>
					<CreditCardRoundedIcon /> {t('Card')}
				</button>
				<button
					type={'button'}
					className={!isCard ? 'active' : ''}
					onClick={() => onChange({ ...value, paymentType: PaymentType.BANK })}
				>
					<AccountBalanceOutlinedIcon /> {t('Bank account')}
				</button>
			</Stack>
			<Stack className={'pay-fields'}>
				{isCard ? (
					<>
						<TextField
							className={'wide'}
							label={t('Card number')}
							value={value.cardNumber}
							onChange={(e) => cardNumberHandler(e.target.value)}
							inputProps={{ inputMode: 'numeric', autoComplete: 'cc-number' }}
							InputProps={{
								endAdornment: brand ? <InputAdornment position={'end'}>{brand}</InputAdornment> : undefined,
							}}
						/>
						<TextField
							label={t('Name on card')}
							value={value.holderName}
							onChange={(e) => set('holderName', e.target.value)}
							inputProps={{ maxLength: 60, autoComplete: 'cc-name' }}
						/>
						<TextField
							label={'MM/YY'}
							value={value.expiry}
							onChange={(e) => expiryHandler(e.target.value)}
							inputProps={{ inputMode: 'numeric', autoComplete: 'cc-exp' }}
						/>
					</>
				) : (
					<>
						<TextField
							label={t('Bank')}
							value={value.bankName}
							onChange={(e) => set('bankName', e.target.value)}
							inputProps={{ maxLength: 40 }}
						/>
						<TextField
							label={t('Account holder')}
							value={value.holderName}
							onChange={(e) => set('holderName', e.target.value)}
							inputProps={{ maxLength: 60 }}
						/>
						<TextField
							className={'wide'}
							label={t('Account number')}
							value={value.accountNumber}
							onChange={(e) => set('accountNumber', e.target.value.replace(/[^\d-\s]/g, '').slice(0, 30))}
							inputProps={{ inputMode: 'numeric' }}
						/>
					</>
				)}
			</Stack>
		</Stack>
	);
};

export default PaymentForm;
