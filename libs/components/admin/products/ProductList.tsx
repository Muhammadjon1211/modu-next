import React, { useState } from 'react';
import Link from 'next/link';
import {
	IconButton,
	MenuItem,
	Select,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Tooltip,
} from '@mui/material';
import DeleteForeverOutlinedIcon from '@mui/icons-material/DeleteForeverOutlined';
import { Product } from '../../../types/product/product';
import { ProductStatus } from '../../../enums/product.enum';
import { categoryLabels } from '../../../config';
import { formatPrice, formatterStr, getImageUrl, imageFallbackHandler, salePrice } from '../../../utils';
import { getComparator, HeadCell, Order } from '../tableSort';

interface Data {
	productTitle: string;
	memberId: string;
	productCategory: string;
	productPrice: number;
	productStock: number;
	productSales: number;
	productStatus: string;
}

const headCells: readonly HeadCell<Data>[] = [
	{ id: 'productTitle', label: 'Product', numeric: false, sortable: true },
	{ id: 'memberId', label: 'Seller', numeric: false },
	{ id: 'productCategory', label: 'Category', numeric: false, sortable: true },
	{ id: 'productPrice', label: 'Price', numeric: true, sortable: true },
	{ id: 'productStock', label: 'Stock', numeric: true, sortable: true },
	{ id: 'productSales', label: 'Sold', numeric: true, sortable: true },
	{ id: 'productStatus', label: 'Status', numeric: false, sortable: true },
];

interface ProductListType {
	products: Product[];
	updateProductHandler: (input: { _id: string; productStatus: ProductStatus }) => void;
	removeProductHandler: (id: string) => void;
}

const ProductList = (props: ProductListType) => {
	const { products, updateProductHandler, removeProductHandler } = props;
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof Data>('productSales');

	/** HANDLERS **/
	const sortHandler = (id: keyof Data) => {
		setOrder(orderBy === id && order === 'desc' ? 'asc' : 'desc');
		setOrderBy(id);
	};

	const rows = [...products].sort((a, b) => getComparator<any>(order, orderBy)(a, b));

	return (
		<TableContainer className={'admin-table'}>
			<Table>
				<TableHead>
					<TableRow>
						{headCells.map((cell) => (
							<TableCell key={cell.id} align={cell.numeric ? 'right' : 'left'}>
								{cell.sortable ? (
									<TableSortLabel
										active={orderBy === cell.id}
										direction={orderBy === cell.id ? order : 'desc'}
										onClick={() => sortHandler(cell.id)}
									>
										{cell.label}
									</TableSortLabel>
								) : (
									cell.label
								)}
							</TableCell>
						))}
						<TableCell />
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.length ? (
						rows.map((product) => (
							<TableRow key={product._id} hover>
								<TableCell>
									<Link
										href={{ pathname: '/product/detail', query: { id: product._id } }}
										target={'_blank'}
										rel={'noreferrer'}
										className={'cell-product'}
									>
										<img src={getImageUrl(product.productImages?.[0])} alt={''} onError={imageFallbackHandler()} />
										<Stack>
											<strong>{product.productTitle}</strong>
											<span>{product.productBrand}</span>
										</Stack>
									</Link>
								</TableCell>
								<TableCell>
									<Link
										href={{ pathname: '/member', query: { memberId: product.memberId } }}
										target={'_blank'}
										rel={'noreferrer'}
									>
										{product.memberData?.memberShopName || product.memberData?.memberNick}
									</Link>
								</TableCell>
								<TableCell>{categoryLabels[product.productCategory]}</TableCell>
								<TableCell align={'right'}>
									{formatPrice(salePrice(product.productPrice, product.productDiscount))}
								</TableCell>
								<TableCell align={'right'}>{formatterStr(product.productStock)}</TableCell>
								<TableCell align={'right'}>{formatterStr(product.productSales)}</TableCell>
								<TableCell>
									<Select
										size={'small'}
										value={product.productStatus}
										className={`status-select ${product.productStatus.toLowerCase()}`}
										disabled={product.productStatus === ProductStatus.DELETE}
										onChange={(e) =>
											updateProductHandler({ _id: product._id, productStatus: e.target.value as ProductStatus })
										}
									>
										{Object.values(ProductStatus).map((status) => (
											<MenuItem key={status} value={status}>
												{status}
											</MenuItem>
										))}
									</Select>
								</TableCell>
								<TableCell align={'right'}>
									{product.productStatus === ProductStatus.DELETE && (
										<Tooltip title={'Remove permanently'}>
											<IconButton color={'secondary'} onClick={() => removeProductHandler(product._id)}>
												<DeleteForeverOutlinedIcon />
											</IconButton>
										</Tooltip>
									)}
								</TableCell>
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={headCells.length + 1} align={'center'} className={'empty-cell'}>
								No products
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default ProductList;
