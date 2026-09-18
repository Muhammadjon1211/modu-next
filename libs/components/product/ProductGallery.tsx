import React, { useEffect, useState } from 'react';
import { Stack } from '@mui/material';
import useDeviceDetect from '../../hooks/useDeviceDetect';
import { getImageUrl, imageFallbackHandler } from '../../utils';

interface ProductGalleryType {
	images: string[];
	title: string;
	discount?: number;
}

const ProductGallery = (props: ProductGalleryType) => {
	const { images, title, discount = 0 } = props;
	const device = useDeviceDetect();
	const [active, setActive] = useState<number>(0);
	const list = images?.length ? images : [''];

	/** LIFECYCLES **/
	useEffect(() => {
		setActive(0);
	}, [images]);

	/** HANDLERS **/
	const changeImageHandler = (index: number) => setActive(index);

	if (device === 'mobile') {
		return (
			<Stack className={'product-gallery'}>
				<Stack className={'gallery-scroll'}>
					{list.map((image, index) => (
						<img key={`${image}-${index}`} src={getImageUrl(image)} alt={title} onError={imageFallbackHandler()} />
					))}
				</Stack>
				{discount > 0 && <span className={'badge sale'}>-{discount}%</span>}
			</Stack>
		);
	} else {
		return (
			<Stack className={'product-gallery'}>
				{list.length > 1 && (
					<Stack className={'thumbs'}>
						{list.map((image, index) => (
							<button
								key={`${image}-${index}`}
								className={index === active ? 'active' : ''}
								onMouseEnter={() => changeImageHandler(index)}
								onClick={() => changeImageHandler(index)}
							>
								<img src={getImageUrl(image)} alt={''} onError={imageFallbackHandler()} />
							</button>
						))}
					</Stack>
				)}
				<Stack className={'main-image'}>
					<img key={list[active]} src={getImageUrl(list[active])} alt={title} onError={imageFallbackHandler()} />
					{discount > 0 && <span className={'badge sale'}>-{discount}%</span>}
				</Stack>
			</Stack>
		);
	}
};

export default ProductGallery;
