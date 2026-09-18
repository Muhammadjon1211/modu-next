import React, { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useLazyQuery, useMutation } from '@apollo/client';
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	Stack,
	TextField,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import { OrderItem } from '../../types/order/order';
import { Product } from '../../types/product/product';
import { ReturnEligibility } from '../../types/return/return';
import { CHECK_RETURN_ELIGIBILITY } from '../../../apollo/user/query';
import { REQUEST_RETURN } from '../../../apollo/user/mutation';
import { ReturnReason } from '../../enums/return.enum';
import { returnReasonLabels } from '../../config';
import { formatDate, formatPrice, getImageUrl, imageFallbackHandler, salePrice } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';

interface ReturnDialogType {
	item: OrderItem | null;
	product?: Product;
	onClose: () => void;
	onDone: () => void;
}

const ReturnDialog = (props: ReturnDialogType) => {
	const { item, product, onClose, onDone } = props;
	const { t } = useTranslation('common');
	const [eligibility, setEligibility] = useState<ReturnEligibility | null>(null);
	const [quantity, setQuantity] = useState<number>(1);
	const [reason, setReason] = useState<ReturnReason | ''>('');
	const [desc, setDesc] = useState<string>('');
	const [saving, setSaving] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [requestReturn] = useMutation(REQUEST_RETURN);
	const [checkReturnEligibility, { loading }] = useLazyQuery(CHECK_RETURN_ELIGIBILITY, {
		fetchPolicy: 'network-only',
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!item) return;
		setEligibility(null);
		setQuantity(1);
		setReason('');
		setDesc('');
		checkReturnEligibility({ variables: { input: item._id } }).then(({ data }) => {
			setEligibility(data?.checkReturnEligibility ?? null);
		});
	}, [item]);

	/** HANDLERS **/
	const submitHandler = async () => {
		try {
			if (!item || !reason) return;
			const input: any = { orderItemId: item._id, returnQuantity: quantity, returnReason: reason };
			if (desc.trim().length >= 3) input.returnDesc = desc.trim();

			setSaving(true);
			await requestReturn({ variables: { input } });
			await sweetTopSmallSuccessAlert(t('Return requested'), 1200);
			onDone();
		} catch (err: any) {
			console.log('ERROR, submitHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSaving(false);
		}
	};

	const unit = item ? salePrice(item.itemPrice, item.itemDiscount) : 0;

	return (
		<Dialog open={!!item} onClose={onClose} fullWidth maxWidth={'xs'} className={'return-dialog'}>
			<DialogTitle>{t('Return item')}</DialogTitle>
			<DialogContent>
				<Stack className={'return-product'}>
					<img src={getImageUrl(product?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
					<Stack>
						<span className={'brand'}>{product?.productBrand}</span>
						<strong>{product?.productTitle}</strong>
					</Stack>
				</Stack>

				{loading || !eligibility ? (
					<Stack className={'loading-box small'}>
						<CircularProgress size={24} color={'inherit'} />
					</Stack>
				) : !eligibility.eligible ? (
					<p className={'not-eligible'}>{eligibility.reason}</p>
				) : (
					<Stack className={'return-form'}>
						<Stack className={'form-row'}>
							<span>{t('Quantity')}</span>
							<Stack className={'qty-stepper'}>
								<IconButton size={'small'} disabled={quantity <= 1} onClick={() => setQuantity(quantity - 1)}>
									<RemoveRoundedIcon fontSize={'small'} />
								</IconButton>
								<span>{quantity}</span>
								<IconButton
									size={'small'}
									disabled={quantity >= eligibility.quantityReturnable}
									onClick={() => setQuantity(quantity + 1)}
								>
									<AddRoundedIcon fontSize={'small'} />
								</IconButton>
							</Stack>
						</Stack>
						<Stack className={'chip-list'}>
							{Object.values(ReturnReason).map((ele) => (
								<button
									key={ele}
									type={'button'}
									className={`chip ${reason === ele ? 'active' : ''}`}
									onClick={() => setReason(ele)}
								>
									{t(returnReasonLabels[ele])}
								</button>
							))}
						</Stack>
						<TextField
							multiline
							minRows={2}
							placeholder={t('Details (optional)')}
							value={desc}
							onChange={(e) => setDesc(e.target.value)}
							inputProps={{ maxLength: 2000 }}
						/>
						<Stack className={'form-row refund'}>
							<span>{t('Refund')}</span>
							<strong>{formatPrice(unit * quantity)}</strong>
						</Stack>
						{eligibility.windowClosesAt && (
							<span className={'window'}>
								{t('Until')} {formatDate(eligibility.windowClosesAt, 'YYYY.MM.DD HH:mm')}
							</span>
						)}
					</Stack>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>{t('Close')}</Button>
				{eligibility?.eligible && (
					<Button variant={'contained'} onClick={submitHandler} disabled={!reason || saving}>
						{t('Request return')}
					</Button>
				)}
			</DialogActions>
		</Dialog>
	);
};

export default ReturnDialog;
