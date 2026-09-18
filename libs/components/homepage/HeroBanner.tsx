import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Button, Stack } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { ProductGroup } from '../../enums/product.enum';

const groupHref = (group: ProductGroup) =>
	`/product?input=${JSON.stringify({ page: 1, limit: 12, sort: 'createdAt', direction: 'DESC', search: { group } })}`;

const saleHref = `/product?input=${JSON.stringify({
	page: 1,
	limit: 12,
	sort: 'createdAt',
	direction: 'DESC',
	search: { options: ['productOnSale'] },
})}`;

const HeroBanner = () => {
	const device = useDeviceDetect();
	const { t } = useTranslation('common');

	const tiles = (
		<Stack className={'hero-tiles'}>
			<Link href={groupHref(ProductGroup.CLOTHES)} className={'hero-tile clothes'}>
				<img src={'/img/banner/clothes.svg'} alt={''} />
				<span>{t('Clothes')}</span>
				<ArrowForwardRoundedIcon />
			</Link>
			<Link href={groupHref(ProductGroup.ACCESSORIES)} className={'hero-tile accessories'}>
				<img src={'/img/banner/accessories.svg'} alt={''} />
				<span>{t('Accessories')}</span>
				<ArrowForwardRoundedIcon />
			</Link>
		</Stack>
	);

	if (device === 'mobile') {
		return (
			<Stack className={'hero-banner'}>
				<Stack className={'hero-main'}>
					<h1>{t('Wear it your way')}</h1>
					<Link href={'/product'}>
						<Button variant={'contained'} color={'secondary'} endIcon={<ArrowForwardRoundedIcon />}>
							{t('Shop now')}
						</Button>
					</Link>
				</Stack>
				{tiles}
			</Stack>
		);
	} else {
		return (
			<Stack className={'hero-banner'}>
				<Stack className={'container'}>
					<Stack className={'hero-main'}>
						<span className={'hero-kicker'}>{t('New season')}</span>
						<h1>{t('Wear it your way')}</h1>
						<Stack className={'hero-actions'}>
							<Link href={'/product'}>
								<Button size={'large'} variant={'contained'} color={'secondary'} endIcon={<ArrowForwardRoundedIcon />}>
									{t('Shop now')}
								</Button>
							</Link>
							<Link href={saleHref}>
								<Button size={'large'} variant={'outlined'} className={'ghost'}>
									{t('Sale')}
								</Button>
							</Link>
						</Stack>
						<img className={'hero-art'} src={'/img/banner/hero.svg'} alt={''} />
					</Stack>
					{tiles}
				</Stack>
			</Stack>
		);
	}
};

export default HeroBanner;
