import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Stack } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import AddressForm, { addressProblem, cleanAddress, emptyAddress } from '../checkout/AddressForm';
import SavedOption from '../checkout/SavedOption';
import { Address } from '../../types/address/address';
import { AddressInput } from '../../types/address/address.input';
import { GET_MY_ADDRESSES } from '../../../apollo/user/query';
import { CREATE_ADDRESS, REMOVE_ADDRESS, UPDATE_ADDRESS } from '../../../apollo/user/mutation';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const MyAddresses = () => {
	const { t } = useTranslation('common');
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [adding, setAdding] = useState<boolean>(false);
	const [form, setForm] = useState<AddressInput>(emptyAddress);
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createAddress] = useMutation(CREATE_ADDRESS);
	const [updateAddress] = useMutation(UPDATE_ADDRESS);
	const [removeAddress] = useMutation(REMOVE_ADDRESS);

	const { loading, refetch } = useQuery(GET_MY_ADDRESSES, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setAddresses(data?.getMyAddresses ?? []),
	});

	/** HANDLERS */
	const createHandler = async () => {
		try {
			const problem = addressProblem(form);
			if (problem) throw new Error(t(problem));
			setSaving(true);
			await createAddress({ variables: { input: cleanAddress(form) } });
			setForm(emptyAddress);
			setAdding(false);
			await refetch();
			await sweetTopSmallSuccessAlert(t('Saved'), 800);
		} catch (err: any) {
			console.log('ERROR, createHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSaving(false);
		}
	};

	const defaultHandler = async (id: string) => {
		try {
			await updateAddress({ variables: { input: { _id: id, isDefault: true } } });
			await refetch();
		} catch (err: any) {
			console.log('ERROR, defaultHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const removeHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Delete this address?')))) return;
			await removeAddress({ variables: { input: id } });
			await refetch();
		} catch (err: any) {
			console.log('ERROR, removeHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className={'my-addresses'}>
			<Stack className={'my-title-row'}>
				<h2 className={'my-title'}>{t('Addresses')}</h2>
				{!adding && (
					<Button variant={'contained'} startIcon={<AddRoundedIcon />} onClick={() => setAdding(true)}>
						{t('Add address')}
					</Button>
				)}
			</Stack>

			{adding && (
				<Stack className={'new-entry'}>
					<AddressForm value={form} onChange={setForm} />
					<Stack className={'form-actions'}>
						<Button onClick={() => setAdding(false)}>{t('Cancel')}</Button>
						<Button variant={'contained'} onClick={createHandler} disabled={saving}>
							{t('Save')}
						</Button>
					</Stack>
				</Stack>
			)}

			<Stack className={'saved-list'}>
				{addresses.length
					? addresses.map((ele) => (
							<SavedOption
								key={ele._id}
								selected={ele.isDefault}
								onSelect={() => !ele.isDefault && defaultHandler(ele._id)}
								title={`${ele.recipientName} · ${ele.recipientPhone}`}
								lines={[
									[ele.addressLine1, ele.addressLine2].filter((x) => x).join(', '),
									[ele.city, ele.postalCode].filter((x) => x).join(' '),
								]}
								badge={ele.isDefault ? t('Default') : undefined}
								actions={
									<Button size={'small'} color={'secondary'} onClick={() => removeHandler(ele._id)}>
										{t('Delete')}
									</Button>
								}
							/>
						))
					: !loading &&
						!adding && (
							<div className={'no-data small'}>
								<p>{t('No saved addresses')}</p>
							</div>
						)}
			</Stack>
		</Stack>
	);
};

export default MyAddresses;
