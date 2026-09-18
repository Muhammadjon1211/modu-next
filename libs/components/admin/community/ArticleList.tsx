import React, { useState } from 'react';
import Link from 'next/link';
import {
	IconButton,
	MenuItem,
	Select,
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
import { BoardArticle } from '../../../types/board-article/board-article';
import { BoardArticleStatus } from '../../../enums/board-article.enum';
import { articleCategoryLabels } from '../../../config';
import { formatDate, formatterStr } from '../../../utils';
import { getComparator, HeadCell, Order } from '../tableSort';

interface Data {
	articleTitle: string;
	articleCategory: string;
	memberId: string;
	articleViews: number;
	articleLikes: number;
	articleComments: number;
	createdAt: string;
	articleStatus: string;
}

const headCells: readonly HeadCell<Data>[] = [
	{ id: 'articleTitle', label: 'Title', numeric: false, sortable: true },
	{ id: 'articleCategory', label: 'Category', numeric: false, sortable: true },
	{ id: 'memberId', label: 'Author', numeric: false },
	{ id: 'articleViews', label: 'Views', numeric: true, sortable: true },
	{ id: 'articleLikes', label: 'Likes', numeric: true, sortable: true },
	{ id: 'articleComments', label: 'Comments', numeric: true, sortable: true },
	{ id: 'createdAt', label: 'Date', numeric: false, sortable: true },
	{ id: 'articleStatus', label: 'Status', numeric: false, sortable: true },
];

interface ArticleListType {
	articles: BoardArticle[];
	updateArticleHandler: (input: { _id: string; articleStatus: BoardArticleStatus }) => void;
	removeArticleHandler: (id: string) => void;
}

const ArticleList = (props: ArticleListType) => {
	const { articles, updateArticleHandler, removeArticleHandler } = props;
	const [order, setOrder] = useState<Order>('desc');
	const [orderBy, setOrderBy] = useState<keyof Data>('createdAt');

	/** HANDLERS **/
	const sortHandler = (id: keyof Data) => {
		setOrder(orderBy === id && order === 'desc' ? 'asc' : 'desc');
		setOrderBy(id);
	};

	const rows = [...articles].sort((a, b) => getComparator<any>(order, orderBy)(a, b));

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
						rows.map((article) => (
							<TableRow key={article._id} hover>
								<TableCell className={'cell-title'}>
									{article.articleStatus === BoardArticleStatus.ACTIVE ? (
										<Link
											href={{ pathname: '/community/detail', query: { id: article._id } }}
											target={'_blank'}
											rel={'noreferrer'}
										>
											{article.articleTitle}
										</Link>
									) : (
										article.articleTitle
									)}
								</TableCell>
								<TableCell>{articleCategoryLabels[article.articleCategory]}</TableCell>
								<TableCell>
									<Link
										href={{ pathname: '/member', query: { memberId: article.memberId } }}
										target={'_blank'}
										rel={'noreferrer'}
									>
										{article.memberData?.memberNick}
									</Link>
								</TableCell>
								<TableCell align={'right'}>{formatterStr(article.articleViews)}</TableCell>
								<TableCell align={'right'}>{formatterStr(article.articleLikes)}</TableCell>
								<TableCell align={'right'}>{formatterStr(article.articleComments)}</TableCell>
								<TableCell>{formatDate(article.createdAt)}</TableCell>
								<TableCell>
									<Select
										size={'small'}
										value={article.articleStatus}
										className={`status-select ${article.articleStatus.toLowerCase()}`}
										disabled={article.articleStatus === BoardArticleStatus.DELETE}
										onChange={(e) =>
											updateArticleHandler({
												_id: article._id,
												articleStatus: e.target.value as BoardArticleStatus,
											})
										}
									>
										{Object.values(BoardArticleStatus).map((status) => (
											<MenuItem key={status} value={status}>
												{status}
											</MenuItem>
										))}
									</Select>
								</TableCell>
								<TableCell align={'right'}>
									{article.articleStatus === BoardArticleStatus.DELETE && (
										<Tooltip title={'Remove permanently'}>
											<IconButton color={'secondary'} onClick={() => removeArticleHandler(article._id)}>
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
								No posts
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
};

export default ArticleList;
