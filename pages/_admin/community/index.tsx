import React, { ChangeEvent, MouseEvent, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery } from '@apollo/client';
import { MenuItem, Select, Stack, Tab, Tabs, TablePagination } from '@mui/material';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import ArticleList from '../../../libs/components/admin/community/ArticleList';
import { BoardArticle } from '../../../libs/types/board-article/board-article';
import { AllBoardArticlesInquiry } from '../../../libs/types/board-article/board-article.input';
import { BoardArticleUpdate } from '../../../libs/types/board-article/board-article.update';
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from '../../../apollo/admin/query';
import { REMOVE_BOARD_ARTICLE_BY_ADMIN, UPDATE_BOARD_ARTICLE_BY_ADMIN } from '../../../apollo/admin/mutation';
import { BoardArticleCategory, BoardArticleStatus } from '../../../libs/enums/board-article.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { articleCategoryLabels } from '../../../libs/config';
import { sweetConfirmAlert, sweetErrorHandlingForAdmin, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: AllBoardArticlesInquiry = {
	page: 1,
	limit: 10,
	sort: 'createdAt',
	direction: Direction.DESC,
	search: {},
};

const AdminCommunity: NextPage = () => {
	const [articlesInquiry, setArticlesInquiry] = useState<AllBoardArticlesInquiry>(defaultInput);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState<number>(0);

	/** APOLLO REQUESTS **/
	const [updateBoardArticleByAdmin] = useMutation(UPDATE_BOARD_ARTICLE_BY_ADMIN);
	const [removeBoardArticleByAdmin] = useMutation(REMOVE_BOARD_ARTICLE_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_BOARD_ARTICLES_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: articlesInquiry },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getAllBoardArticlesByAdmin?.list ?? []);
			setTotal(data?.getAllBoardArticlesByAdmin?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** HANDLERS **/
	const tabChangeHandler = (newValue: string) => {
		setArticlesInquiry({
			...articlesInquiry,
			page: 1,
			search: {
				...articlesInquiry.search,
				articleStatus: newValue === 'ALL' ? undefined : (newValue as BoardArticleStatus),
			},
		});
	};

	const categoryHandler = (newValue: string) => {
		setArticlesInquiry({
			...articlesInquiry,
			page: 1,
			search: {
				...articlesInquiry.search,
				articleCategory: newValue === 'ALL' ? undefined : (newValue as BoardArticleCategory),
			},
		});
	};

	const changePageHandler = (event: MouseEvent<HTMLButtonElement> | null, newPage: number) => {
		setArticlesInquiry({ ...articlesInquiry, page: newPage + 1 });
	};

	const changeRowsPerPageHandler = (event: ChangeEvent<HTMLInputElement>) => {
		setArticlesInquiry({ ...articlesInquiry, page: 1, limit: parseInt(event.target.value, 10) });
	};

	const updateArticleHandler = async (input: BoardArticleUpdate) => {
		try {
			if (input.articleStatus === BoardArticleStatus.DELETE && !(await sweetConfirmAlert('Delete this post?'))) return;
			await updateBoardArticleByAdmin({ variables: { input } });
			await refetch({ input: articlesInquiry });
			await sweetTopSmallSuccessAlert('Updated', 800);
		} catch (err: any) {
			console.log('ERROR, updateArticleHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	const removeArticleHandler = async (id: string) => {
		try {
			if (!(await sweetConfirmAlert('Remove permanently?'))) return;
			await removeBoardArticleByAdmin({ variables: { input: id } });
			await refetch({ input: articlesInquiry });
			await sweetTopSmallSuccessAlert('Removed', 800);
		} catch (err: any) {
			console.log('ERROR, removeArticleHandler:', err.message);
			sweetErrorHandlingForAdmin(err).then();
		}
	};

	return (
		<Stack className={'admin-page'}>
			<h2 className={'admin-title'}>Community</h2>
			<Stack className={'admin-toolbar'}>
				<Tabs
					value={articlesInquiry.search.articleStatus ?? 'ALL'}
					onChange={(e, newValue) => tabChangeHandler(newValue)}
				>
					<Tab value={'ALL'} label={'All'} />
					<Tab value={BoardArticleStatus.ACTIVE} label={'Active'} />
					<Tab value={BoardArticleStatus.DELETE} label={'Deleted'} />
				</Tabs>
				<Select
					size={'small'}
					value={articlesInquiry.search.articleCategory ?? 'ALL'}
					onChange={(e) => categoryHandler(e.target.value)}
				>
					<MenuItem value={'ALL'}>All categories</MenuItem>
					{Object.values(BoardArticleCategory).map((category) => (
						<MenuItem key={category} value={category}>
							{articleCategoryLabels[category]}
						</MenuItem>
					))}
				</Select>
			</Stack>
			<ArticleList
				articles={articles}
				updateArticleHandler={updateArticleHandler}
				removeArticleHandler={removeArticleHandler}
			/>
			<TablePagination
				component={'div'}
				count={total}
				page={articlesInquiry.page - 1}
				rowsPerPage={articlesInquiry.limit}
				rowsPerPageOptions={[10, 20, 40]}
				onPageChange={changePageHandler}
				onRowsPerPageChange={changeRowsPerPageHandler}
			/>
		</Stack>
	);
};

export default withAdminLayout(AdminCommunity);
