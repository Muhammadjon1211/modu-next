import React, { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Stack } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PaymentForm, { emptyPayment, PaymentFormValue, paymentProblem, toPaymentInput } from '../checkout/PaymentForm';
import SavedOption from '../checkout/SavedOption';
import { PaymentMethod } from '../../types/payment/payment';
import { GET_MY_PAYMENT_METHODS } from '../../../apollo/user/query';
import { CREATE_PAYMENT_METHOD, REMOVE_PAYMENT_METHOD, UPDATE_PAYMENT_METHOD } from '../../../apollo/user/mutation';
import { paymentLabel } from '../../utils';
import { sweetConfirmAlert, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const MyPayments = () => {
	const { t } = useTranslation('common');
	const [methods, setMethods] = useState<PaymentMethod[]>([]);
	const [adding, setAdding] = useState<boolean>(false);
	const [form, setForm] = useState<PaymentFormValue>(emptyPayment);
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createPaymentMethod] = useMutation(CREATE_PAYMENT_METHOD);
	const [updatePaymentMethod] = useMutation(UPDATE_PAYMENT_METHOD);
	const [removePaymentMethod] = useMutation(REMOVE_PAYMENT_METHOD);

	const { loading, refetch } = useQuery(GET_MY_PAYMENT_METHODS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setMethods(data?.getMyPaymentMethods ?? []),
	});

	/** HANDLERS */
	const createHandler = async () => {
		try {
			const problem = paymentProblem(form);
			if (problem) throw new Error(t(problem));
			setSaving(true);
			await createPaymentMethod({ variables: { input: toPaymentInput(form) } });
			setForm(emptyPayment);
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
			await updatePaymentMethod({ variables: { input: { _id: id, isDefault: true } } });
			await refetch();
		} catch (err: any) {
			console.log('ERROR, defaultHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	const removeHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert(t('Delete this payment method?')))) return;
			await removePaymentMethod({ variables: { input: id } });
			await refetch();
		} catch (err: any) {
			console.log('ERROR, removeHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		}
	};

	return (
		<Stack className={'my-payments'}>
			<Stack className={'my-title-row'}>
				<h2 className={'my-title'}>{t('Payment methods')}</h2>
				{!adding && (
					<Button variant={'contained'} startIcon={<AddRoundedIcon />} onClick={() => setAdding(true)}>
						{t('Add payment method')}
					</Button>
				)}
			</Stack>

			{adding && (
				<Stack className={'new-entry'}>
					<PaymentForm value={form} onChange={setForm} />
					<Stack className={'form-actions'}>
						<Button onClick={() => setAdding(false)}>{t('Cancel')}</Button>
						<Button variant={'contained'} onClick={createHandler} disabled={saving}>
							{t('Save')}
						</Button>
					</Stack>
				</Stack>
			)}

			<Stack className={'saved-list'}>
				{methods.length
					? methods.map((ele) => (
							<SavedOption
								key={ele._id}
								selected={ele.isDefault}
								onSelect={() => !ele.isDefault && defaultHandler(ele._id)}
								title={paymentLabel(ele)}
								lines={[
									ele.holderName +
										(ele.expMonth
											? ` · ${String(ele.expMonth).padStart(2, '0')}/${String(ele.expYear).slice(-2)}`
											: ''),
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
								<p>{t('No saved payment methods')}</p>
							</div>
						)}
			</Stack>
		</Stack>
	);
};

export default MyPayments;
