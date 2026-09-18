import React, { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Button, InputBase, Pagination, Stack, Tab, Tabs } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import useDeviceDetect from '../../libs/hooks/useDeviceDetect';
import withLayoutBasic from '../../libs/components/layout/LayoutBasic';
import ArticleCard from '../../libs/components/common/ArticleCard';
import { BoardArticle } from '../../libs/types/board-article/board-article';
import { BoardArticlesInquiry } from '../../libs/types/board-article/board-article.input';
import { GET_BOARD_ARTICLES } from '../../apollo/user/query';
import { LIKE_TARGET_BOARD_ARTICLE } from '../../apollo/user/mutation';
import { userVar } from '../../apollo/store';
import { BoardArticleCategory } from '../../libs/enums/board-article.enum';
import { Direction } from '../../libs/enums/common.enum';
import { articleCategoryLabels } from '../../libs/config';
import { likeTargetBoardArticleHandler } from '../../libs/utils';
import { T } from '../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const defaultInput: BoardArticlesInquiry = {
	page: 1,
	limit: 9,
	sort: 'createdAt',
	direction: Direction.DESC,
	articleCategory: BoardArticleCategory.LOOKBOOK,
	search: {},
};

interface CommunityType {
	initialInput?: BoardArticlesInquiry;
}

const Community: NextPage<CommunityType> = ({ initialInput = defaultInput }) => {
	const device = useDeviceDetect();
	const router = useRouter();
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const [searchFilter, setSearchFilter] = useState<BoardArticlesInquiry>(initialInput);
	const [articles, setArticles] = useState<BoardArticle[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [searchText, setSearchText] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [likeTargetBoardArticle] = useMutation(LIKE_TARGET_BOARD_ARTICLE);

	const { loading, refetch } = useQuery(GET_BOARD_ARTICLES, {
		fetchPolicy: 'cache-and-network',
		variables: { input: searchFilter },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => {
			setArticles(data?.getBoardArticles?.list ?? []);
			setTotal(data?.getBoardArticles?.metaCounter?.[0]?.total ?? 0);
		},
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (!router.isReady) return;
		const input: BoardArticlesInquiry = router.query?.input
			? JSON.parse(router.query.input as string)
			: { ...initialInput, articleCategory: (router.query?.articleCategory as BoardArticleCategory) ?? 'LOOKBOOK' };
		setSearchFilter({ ...initialInput, ...input, search: input.search ?? {} });
		setSearchText(input.search?.text ?? '');
	}, [router]);

	/** HANDLERS **/
	const pushInputHandler = async (input: BoardArticlesInquiry) => {
		await router.push(`/community?input=${JSON.stringify(input)}`, `/community?input=${JSON.stringify(input)}`, {
			scroll: false,
		});
	};

	const categoryHandler = (articleCategory: BoardArticleCategory) => {
		pushInputHandler({ ...searchFilter, page: 1, articleCategory }).then();
	};

	const searchTextHandler = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key !== 'Enter') return;
		pushInputHandler({ ...searchFilter, page: 1, search: { text: searchText.trim() || undefined } }).then();
	};

	const handlePaginationChange = async (event: ChangeEvent<unknown>, value: number) => {
		await pushInputHandler({ ...searchFilter, page: value });
		window.scrollTo({ top: 0, behavior: 'smooth' });
	};

	const likeArticleHandler = async (id: string) => {
		await likeTargetBoardArticleHandler(likeTargetBoardArticle, id, user?._id);
		await refetch({ input: searchFilter });
	};

	const content = (
		<>
			<Stack className={'community-toolbar'}>
				<Tabs
					value={searchFilter.articleCategory}
					onChange={(e, value) => categoryHandler(value)}
					variant={'scrollable'}
					scrollButtons={false}
				>
					{Object.values(BoardArticleCategory).map((category) => (
						<Tab key={category} value={category} label={t(articleCategoryLabels[category])} />
					))}
				</Tabs>
				<Stack className={'toolbar-right'}>
					<Stack className={'search-field'}>
						<SearchRoundedIcon />
						<InputBase
							placeholder={t('Search')}
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
							onKeyDown={searchTextHandler}
						/>
					</Stack>
					{user?._id && (
						<Link href={{ pathname: '/mypage', query: { category: 'writeArticle' } }}>
							<Button variant={'contained'} startIcon={<EditRoundedIcon />}>
								{t('Write')}
							</Button>
						</Link>
					)}
				</Stack>
			</Stack>
			<Stack className={'article-grid'}>
				{articles.length ? (
					articles.map((article) => (
						<ArticleCard key={article._id} article={article} likeArticleHandler={likeArticleHandler} />
					))
				) : loading ? null : (
					<div className={'no-data'}>
						<img src="/img/icons/icoAlert.svg" alt="" />
						<p>{t('No posts yet')}</p>
					</div>
				)}
			</Stack>
			{total > searchFilter.limit && (
				<Stack className={'pagination-config'}>
					<Pagination
						page={searchFilter.page}
						count={Math.ceil(total / searchFilter.limit)}
						onChange={handlePaginationChange}
						shape={'circular'}
						color={'primary'}
					/>
				</Stack>
			)}
		</>
	);

	if (device === 'mobile') {
		return <div id="community-list-page">{content}</div>;
	} else {
		return (
			<div id="community-list-page">
				<Stack className={'container'}>{content}</Stack>
			</div>
		);
	}
};

export default withLayoutBasic(Community);
