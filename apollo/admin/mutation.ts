import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const CREATE_ADMIN_BY_ADMIN = gql`
	mutation CreateAdminByAdmin($input: MemberInput!) {
		createAdminByAdmin(input: $input) {
			_id
			memberNick
			memberType
		}
	}
`;

export const UPDATE_MEMBER_BY_ADMIN = gql`
	mutation UpdateMemberByAdmin($input: MemberUpdate!) {
		updateMemberByAdmin(input: $input) {
			_id
			memberType
			memberStatus
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const UPDATE_PRODUCT_BY_ADMIN = gql`
	mutation UpdateProductByAdmin($input: ProductUpdate!) {
		updateProductByAdmin(input: $input) {
			_id
			productStatus
		}
	}
`;

export const REMOVE_PRODUCT_BY_ADMIN = gql`
	mutation RemoveProductByAdmin($input: String!) {
		removeProductByAdmin(productId: $input) {
			_id
		}
	}
`;

/**************************
 *         ORDER          *
 *************************/

export const UPDATE_ORDER_BY_ADMIN = gql`
	mutation UpdateOrderByAdmin($input: OrderUpdate!) {
		updateOrderByAdmin(input: $input) {
			_id
			orderStatus
		}
	}
`;

/**************************
 *         RETURN         *
 *************************/

export const UPDATE_RETURN_BY_ADMIN = gql`
	mutation UpdateReturnByAdmin($input: ReturnUpdate!) {
		updateReturnByAdmin(input: $input) {
			_id
			returnStatus
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
		updateBoardArticleByAdmin(input: $input) {
			_id
			articleStatus
		}
	}
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
	mutation RemoveBoardArticleByAdmin($input: String!) {
		removeBoardArticleByAdmin(articleId: $input) {
			_id
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const REMOVE_COMMENT_BY_ADMIN = gql`
	mutation RemoveCommentByAdmin($input: String!) {
		removeCommentByAdmin(commentId: $input) {
			_id
		}
	}
`;
