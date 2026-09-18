import React from 'react';
import { useTranslation } from 'next-i18next';
import { Stack, TextField } from '@mui/material';
import { AddressInput } from '../../types/address/address.input';

export const emptyAddress: AddressInput = {
	recipientName: '',
	recipientPhone: '',
	addressLine1: '',
	addressLine2: '',
	city: '',
	postalCode: '',
};

/** mirrors the backend validators so most mistakes are caught before a round trip */
export const addressProblem = (value: AddressInput): string => {
	if (value.recipientName.trim().length < 2) return 'Enter the recipient name';
	if (!/^[0-9+\-\s()]{7,20}$/.test(value.recipientPhone.trim())) return 'Enter a valid phone number';
	if (value.addressLine1.trim().length < 3) return 'Enter the street address';
	if (value.city.trim().length < 2) return 'Enter the city';
	return '';
};

export const cleanAddress = (value: AddressInput): AddressInput => ({
	recipientName: value.recipientName.trim(),
	recipientPhone: value.recipientPhone.trim(),
	addressLine1: value.addressLine1.trim(),
	addressLine2: value.addressLine2?.trim() || undefined,
	city: value.city.trim(),
	postalCode: value.postalCode?.trim() || undefined,
});

interface AddressFormType {
	value: AddressInput;
	onChange: (value: AddressInput) => void;
}

const AddressForm = (props: AddressFormType) => {
	const { value, onChange } = props;
	const { t } = useTranslation('common');
	const set = (name: keyof AddressInput, next: string) => onChange({ ...value, [name]: next });

	return (
		<Stack className={'address-form'}>
			<TextField
				label={t('Recipient')}
				value={value.recipientName}
				onChange={(e) => set('recipientName', e.target.value)}
				autoComplete={'name'}
				inputProps={{ maxLength: 40 }}
			/>
			<TextField
				label={t('Phone')}
				value={value.recipientPhone}
				onChange={(e) => set('recipientPhone', e.target.value)}
				autoComplete={'tel'}
				inputProps={{ maxLength: 20 }}
			/>
			<TextField
				className={'wide'}
				label={t('Street address')}
				value={value.addressLine1}
				onChange={(e) => set('addressLine1', e.target.value)}
				autoComplete={'address-line1'}
				inputProps={{ maxLength: 200 }}
			/>
			<TextField
				className={'wide'}
				label={t('Apartment, floor (optional)')}
				value={value.addressLine2 ?? ''}
				onChange={(e) => set('addressLine2', e.target.value)}
				autoComplete={'address-line2'}
				inputProps={{ maxLength: 200 }}
			/>
			<TextField
				label={t('City')}
				value={value.city}
				onChange={(e) => set('city', e.target.value)}
				autoComplete={'address-level2'}
				inputProps={{ maxLength: 60 }}
			/>
			<TextField
				label={t('Postal code')}
				value={value.postalCode ?? ''}
				onChange={(e) => set('postalCode', e.target.value)}
				autoComplete={'postal-code'}
				inputProps={{ maxLength: 12 }}
			/>
		</Stack>
	);
};

export default AddressForm;
