import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Checkbox, CircularProgress, Divider, FormControlLabel, Stack } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import AddressForm, { addressProblem, cleanAddress, emptyAddress } from '../../libs/components/checkout/AddressForm';
import PaymentForm, {
	emptyPayment,
	PaymentFormValue,
	paymentProblem,
	toPaymentInput,
} from '../../libs/components/checkout/PaymentForm';
import SavedOption from '../../libs/components/checkout/SavedOption';
import { cartLineProblem } from '../../libs/components/cart/CartItem';
import { Order } from '../../libs/types/order/order';
import { OrderInput } from '../../libs/types/order/order.input';
import { Address } from '../../libs/types/address/address';
import { AddressInput } from '../../libs/types/address/address.input';
import { PaymentMethod } from '../../libs/types/payment/payment';
import { GET_MY_ADDRESSES, GET_MY_CART, GET_MY_PAYMENT_METHODS } from '../../apollo/user/query';
import { CREATE_ORDER } from '../../apollo/user/mutation';
import { cartCountVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { formatPrice, getImageUrl, imageFallbackHandler, paymentLabel, salePrice } from '../../libs/utils';
import { sweetMixinErrorAlert, sweetTopSuccessAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const NEW = 'NEW';

const Checkout: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [authed, setAuthed] = useState<boolean>(false);
	const [cart, setCart] = useState<Order | null>(null);
	const [addresses, setAddresses] = useState<Address[]>([]);
	const [methods, setMethods] = useState<PaymentMethod[]>([]);
	const [addressId, setAddressId] = useState<string>(NEW);
	const [paymentId, setPaymentId] = useState<string>(NEW);
	const [address, setAddress] = useState<AddressInput>(emptyAddress);
	const [payment, setPayment] = useState<PaymentFormValue>(emptyPayment);
	const [saveAddress, setSaveAddress] = useState<boolean>(true);
	const [savePayment, setSavePayment] = useState<boolean>(true);
	const [placing, setPlacing] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [createOrder] = useMutation(CREATE_ORDER);

	const { loading } = useQuery(GET_MY_CART, {
		fetchPolicy: 'network-only',
		skip: !authed,
		onCompleted: (data: T) => setCart(data?.getMyCart ?? null),
	});

	useQuery(GET_MY_ADDRESSES, {
		fetchPolicy: 'network-only',
		skip: !authed,
		onCompleted: (data: T) => {
			const list: Address[] = data?.getMyAddresses ?? [];
			setAddresses(list);
			// the default (first) saved address is preselected; with none, the form is open
			if (list.length) setAddressId(list[0]._id);
		},
	});

	useQuery(GET_MY_PAYMENT_METHODS, {
		fetchPolicy: 'network-only',
		skip: !authed,
		onCompleted: (data: T) => {
			const list: PaymentMethod[] = data?.getMyPaymentMethods ?? [];
			setMethods(list);
			if (list.length) setPaymentId(list[0]._id);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!getJwtToken()) router.push('/account/join').then();
		else setAuthed(true);
	}, []);

	/** HANDLERS **/
	const placeOrderHandler = async () => {
		try {
			const input: OrderInput = {};

			if (addressId === NEW) {
				const problem = addressProblem(address);
				if (problem) throw new Error(t(problem));
				input.shipping = cleanAddress(address);
				input.saveAddress = saveAddress;
			} else input.addressId = addressId;

			if (paymentId === NEW) {
				const problem = paymentProblem(payment);
				if (problem) throw new Error(t(problem));
				input.payment = toPaymentInput(payment);
				input.savePayment = savePayment;
			} else input.paymentMethodId = paymentId;

			setPlacing(true);
			await createOrder({ variables: { input } });
			cartCountVar(0);
			await sweetTopSuccessAlert(t('Order placed'), 1500);
			await router.replace({ pathname: '/mypage', query: { category: 'myOrders' } });
		} catch (err: any) {
			console.log('ERROR, placeOrderHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setPlacing(false);
		}
	};

	const items = cart?.orderItems ?? [];
	const productOf = (id: string) => cart?.productData?.find((ele) => ele._id === id);
	const blocked = items.some((item) => !!cartLineProblem(item, productOf(item.productId)));

	if (!cart) {
		return (
			<div id="checkout-page">
				<Stack className={'loading-box'}>{(loading || !authed) && <CircularProgress color={'inherit'} />}</Stack>
			</div>
		);
	}

	if (!items.length || blocked) {
		return (
			<div id="checkout-page">
				<Stack className={'container'}>
					<Stack className={'empty-cart'}>
						<h3>{items.length ? t('Fix the marked items first') : t('Your cart is empty')}</h3>
						<Link href={'/cart'}>
							<Button variant={'contained'}>{t('Cart')}</Button>
						</Link>
					</Stack>
				</Stack>
			</div>
		);
	}

	const shippingSection = (
		<Stack className={'checkout-section'}>
			<h2>{t('Shipping')}</h2>
			<Stack className={'saved-list'}>
				{addresses.map((ele) => (
					<SavedOption
						key={ele._id}
						selected={addressId === ele._id}
						onSelect={() => setAddressId(ele._id)}
						title={`${ele.recipientName} · ${ele.recipientPhone}`}
						lines={[
							[ele.addressLine1, ele.addressLine2].filter((x) => x).join(', '),
							[ele.city, ele.postalCode].filter((x) => x).join(' '),
						]}
						badge={ele.isDefault ? t('Default') : undefined}
					/>
				))}
				{addresses.length > 0 && (
					<SavedOption selected={addressId === NEW} onSelect={() => setAddressId(NEW)} title={t('New address')} />
				)}
			</Stack>
			{addressId === NEW && (
				<Stack className={'new-entry'}>
					<AddressForm value={address} onChange={setAddress} />
					<FormControlLabel
						control={<Checkbox checked={saveAddress} onChange={(e) => setSaveAddress(e.target.checked)} />}
						label={t('Save this address')}
					/>
				</Stack>
			)}
		</Stack>
	);

	const paymentSection = (
		<Stack className={'checkout-section'}>
			<h2>{t('Payment')}</h2>
			<Stack className={'saved-list'}>
				{methods.map((ele) => (
					<SavedOption
						key={ele._id}
						selected={paymentId === ele._id}
						onSelect={() => setPaymentId(ele._id)}
						title={paymentLabel(ele)}
						lines={[
							ele.holderName +
								(ele.expMonth ? ` · ${String(ele.expMonth).padStart(2, '0')}/${String(ele.expYear).slice(-2)}` : ''),
						]}
						badge={ele.isDefault ? t('Default') : undefined}
					/>
				))}
				{methods.length > 0 && (
					<SavedOption
						selected={paymentId === NEW}
						onSelect={() => setPaymentId(NEW)}
						title={t('New payment method')}
					/>
				)}
			</Stack>
			{paymentId === NEW && (
				<Stack className={'new-entry'}>
					<PaymentForm value={payment} onChange={setPayment} />
					<FormControlLabel
						control={<Checkbox checked={savePayment} onChange={(e) => setSavePayment(e.target.checked)} />}
						label={t('Save for next time')}
					/>
				</Stack>
			)}
		</Stack>
	);

	const summary = (
		<Stack className={'checkout-summary'}>
			<h2>{t('Order')}</h2>
			<Stack className={'summary-lines'}>
				{items.map((item) => {
					const product = productOf(item.productId);
					const variant = [item.itemSize, item.itemColor ? t(item.itemColor) : ''].filter((x) => x).join(' · ');
					return (
						<Stack key={item._id} className={'summary-line'}>
							<img src={getImageUrl(product?.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
							<Stack className={'line-main'}>
								<strong>{product?.productTitle}</strong>
								<span>
									{variant && `${variant} · `}×{item.itemQuantity}
								</span>
							</Stack>
							<strong>{formatPrice(salePrice(item.itemPrice, item.itemDiscount) * item.itemQuantity)}</strong>
						</Stack>
					);
				})}
			</Stack>
			<Divider />
			<Stack className={'row'}>
				<span>{t('Subtotal')}</span>
				<strong>{formatPrice(cart.orderSubTotal)}</strong>
			</Stack>
			<Stack className={'row'}>
				<span>{t('Delivery')}</span>
				<strong>{formatPrice(cart.orderDelivery)}</strong>
			</Stack>
			<Divider />
			<Stack className={'row total'}>
				<span>{t('Total')}</span>
				<strong>{formatPrice(cart.orderTotal)}</strong>
			</Stack>
			<Button
				variant={'contained'}
				size={'large'}
				fullWidth
				disabled={placing}
				onClick={placeOrderHandler}
				startIcon={<LockOutlinedIcon />}
			>
				{t('Place order')} · {formatPrice(cart.orderTotal)}
			</Button>
			<span className={'test-note'}>{t('Test mode — no real charge is made')}</span>
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<div id="checkout-page">
				{shippingSection}
				{paymentSection}
				{summary}
			</div>
		);
	} else {
		return (
			<div id="checkout-page">
				<Stack className={'container'}>
					<Stack className={'checkout-main'}>
						{shippingSection}
						{paymentSection}
					</Stack>
					{summary}
				</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(Checkout);
