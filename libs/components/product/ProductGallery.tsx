import React, { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { IconButton, Stack } from '@mui/material';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
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
	const thumbsRef = useRef<HTMLDivElement>(null);
	const slidesRef = useRef<HTMLDivElement>(null);
	const list = images?.length ? images : [''];
	const many = list.length > 1;

	/** LIFECYCLES **/
	useEffect(() => {
		setActive(0);
	}, [images]);

	// keep the selected thumbnail inside the scrolling rail, without moving the page
	useEffect(() => {
		const rail = thumbsRef.current;
		const thumb = rail?.children[active] as HTMLElement | undefined;
		if (!rail || !thumb) return;
		const top = thumb.offsetTop;
		const bottom = top + thumb.offsetHeight;
		if (top < rail.scrollTop) rail.scrollTo({ top: top - 4, behavior: 'smooth' });
		else if (bottom > rail.scrollTop + rail.clientHeight)
			rail.scrollTo({ top: bottom - rail.clientHeight + 4, behavior: 'smooth' });
	}, [active]);

	/** HANDLERS **/
	const changeImageHandler = (index: number) => setActive((index + list.length) % list.length);

	const keyHandler = (e: KeyboardEvent<HTMLDivElement>) => {
		if (!many) return;
		if (e.key === 'ArrowRight') changeImageHandler(active + 1);
		if (e.key === 'ArrowLeft') changeImageHandler(active - 1);
	};

	/** mobile: the swipe position decides the dot */
	const slideScrollHandler = () => {
		const box = slidesRef.current;
		if (!box) return;
		const index = Math.round(box.scrollLeft / box.clientWidth);
		if (index !== active) setActive(index);
	};

	const goToSlideHandler = (index: number) => {
		const box = slidesRef.current;
		box?.scrollTo({ left: index * box.clientWidth, behavior: 'smooth' });
	};

	if (device === 'mobile') {
		return (
			<Stack className={'product-gallery'}>
				<Stack className={'gallery-scroll'} ref={slidesRef} onScroll={slideScrollHandler}>
					{list.map((image, index) => (
						<img key={`${image}-${index}`} src={getImageUrl(image)} alt={title} onError={imageFallbackHandler()} />
					))}
				</Stack>
				{discount > 0 && <span className={'badge sale'}>-{discount}%</span>}
				{many && (
					<>
						<span className={'gallery-count'}>
							{active + 1} / {list.length}
						</span>
						<Stack className={'gallery-dots'}>
							{list.map((image, index) => (
								<button
									key={`${image}-${index}`}
									className={index === active ? 'active' : ''}
									aria-label={`${index + 1}`}
									onClick={() => goToSlideHandler(index)}
								/>
							))}
						</Stack>
					</>
				)}
			</Stack>
		);
	} else {
		return (
			<Stack className={'product-gallery'}>
				{many && (
					<Stack className={'thumbs-rail'}>
						<Stack className={'thumbs'} ref={thumbsRef}>
							{list.map((image, index) => (
								<button
									key={`${image}-${index}`}
									className={index === active ? 'active' : ''}
									onClick={() => changeImageHandler(index)}
									aria-label={`${index + 1}`}
								>
									<img src={getImageUrl(image)} alt={''} onError={imageFallbackHandler()} />
								</button>
							))}
						</Stack>
					</Stack>
				)}
				<Stack className={'main-image'} tabIndex={many ? 0 : -1} onKeyDown={keyHandler}>
					<img key={list[active]} src={getImageUrl(list[active])} alt={title} onError={imageFallbackHandler()} />
					{discount > 0 && <span className={'badge sale'}>-{discount}%</span>}
					{many && (
						<>
							<IconButton
								className={'gallery-arrow prev'}
								aria-label={'previous'}
								onClick={() => changeImageHandler(active - 1)}
							>
								<ChevronLeftRoundedIcon />
							</IconButton>
							<IconButton
								className={'gallery-arrow next'}
								aria-label={'next'}
								onClick={() => changeImageHandler(active + 1)}
							>
								<ChevronRightRoundedIcon />
							</IconButton>
							<span className={'gallery-count'}>
								{active + 1} / {list.length}
							</span>
						</>
					)}
				</Stack>
			</Stack>
		);
	}
};

export default ProductGallery;
