import React, { useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery } from '@apollo/client';
import { Button, CircularProgress, Divider, Stack } from '@mui/material';
import ShoppingBagOutlinedIcon from '@mui/icons-material/ShoppingBagOutlined';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import CartItem, { cartLineProblem } from '../../libs/components/cart/CartItem';
import { Order, OrderItem } from '../../libs/types/order/order';
import { GET_MY_CART } from '../../apollo/user/query';
import { REMOVE_FROM_CART, UPDATE_CART_ITEM } from '../../apollo/user/mutation';
import { cartCountVar } from '../../apollo/store';
import { getJwtToken } from '../../libs/auth';
import { formatPrice } from '../../libs/utils';
import { sweetMixinErrorAlert } from '../../libs/sweetAlert';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const Cart: NextPage = () => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const [cart, setCart] = useState<Order | null>(null);
	const [busy, setBusy] = useState<boolean>(false);
	const [authed, setAuthed] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [updateCartItem] = useMutation(UPDATE_CART_ITEM);
	const [removeFromCart] = useMutation(REMOVE_FROM_CART);

	const { loading, refetch } = useQuery(GET_MY_CART, {
		fetchPolicy: 'network-only',
		skip: !authed,
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setCart(data?.getMyCart ?? null);
			cartCountVar(data?.getMyCart?.orderItems?.length ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!getJwtToken()) router.push('/account/join').then();
		else setAuthed(true);
	}, []);

	/** HANDLERS **/
	const reloadCartHandler = async () => {
		const { data } = await refetch();
		setCart(data?.getMyCart ?? null);
		cartCountVar(data?.getMyCart?.orderItems?.length ?? 0);
	};

	const changeQuantityHandler = async (item: OrderItem, quantity: number) => {
		try {
			if (quantity < 1) return;
			setBusy(true);
			await updateCartItem({ variables: { input: { orderItemId: item._id, itemQuantity: quantity } } });
			await reloadCartHandler();
		} catch (err: any) {
			console.log('ERROR, changeQuantityHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setBusy(false);
		}
	};

	const removeItemHandler = async (item: OrderItem) => {
		try {
			setBusy(true);
			await removeFromCart({ variables: { input: item._id } });
			await reloadCartHandler();
		} catch (err: any) {
			console.log('ERROR, removeItemHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setBusy(false);
		}
	};

	const items = cart?.orderItems ?? [];
	const productOf = (id: string) => cart?.productData?.find((ele) => ele._id === id);
	const hasProblem = items.some((item) => !!cartLineProblem(item, productOf(item.productId)));
	const itemCount = items.reduce((sum, ele) => sum + ele.itemQuantity, 0);

	if (!cart) {
		return (
			<div id="cart-page">
				<Stack className={'loading-box'}>{(loading || !authed) && <CircularProgress color={'inherit'} />}</Stack>
			</div>
		);
	}

	if (!items.length) {
		return (
			<div id="cart-page">
				<Stack className={'container'}>
					<Stack className={'empty-cart'}>
						<ShoppingBagOutlinedIcon />
						<h3>{t('Your cart is empty')}</h3>
						<Link href={'/product'}>
							<Button variant={'contained'}>{t('Shop now')}</Button>
						</Link>
					</Stack>
				</Stack>
			</div>
		);
	}

	const summary = (
		<Stack className={'cart-summary'}>
			<Stack className={'row'}>
				<span>
					{t('Subtotal')} ({itemCount})
				</span>
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
			{hasProblem && <span className={'summary-warn'}>{t('Fix the marked items first')}</span>}
			<Link href={'/checkout'} className={busy || hasProblem ? 'disabled-link' : ''}>
				<Button variant={'contained'} size={'large'} fullWidth disabled={busy || hasProblem}>
					{t('Checkout')}
				</Button>
			</Link>
		</Stack>
	);

	const list = (
		<Stack className={'cart-list'}>
			{items.map((item) => (
				<CartItem
					key={item._id}
					item={item}
					product={productOf(item.productId)}
					busy={busy}
					changeQuantityHandler={changeQuantityHandler}
					removeItemHandler={removeItemHandler}
				/>
			))}
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<div id="cart-page">
				{list}
				{summary}
			</div>
		);
	} else {
		return (
			<div id="cart-page">
				<Stack className={'container'}>
					{list}
					{summary}
				</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(Cart);
