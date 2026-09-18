import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
	query GetAllMembersByAdmin($input: MembersInquiry!) {
		getAllMembersByAdmin(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberAuthType
				memberPhone
				memberNick
				memberFullName
				memberImage
				memberShopName
				memberProducts
				memberArticles
				memberOrders
				memberSales
				memberWarnings
				memberBlocks
				createdAt
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const GET_ALL_PRODUCTS_BY_ADMIN = gql`
	query GetAllProductsByAdmin($input: AllProductsInquiry!) {
		getAllProductsByAdmin(input: $input) {
			list {
				_id
				productCategory
				productStatus
				productBrand
				productTitle
				productPrice
				productDiscount
				productStock
				productImages
				productSales
				productViews
				productLikes
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberShopName
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         ORDER          *
 *************************/

export const GET_ALL_ORDERS_BY_ADMIN = gql`
	query GetAllOrdersByAdmin($input: AllOrdersInquiry!) {
		getAllOrdersByAdmin(input: $input) {
			list {
				_id
				orderStatus
				orderSubTotal
				orderDelivery
				orderTotal
				memberId
				purchasedAt
				createdAt
				updatedAt
				orderItems {
					_id
					itemQuantity
					productId
				}
				productData {
					_id
					productTitle
					productImages
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *         RETURN         *
 *************************/

export const GET_ALL_RETURNS_BY_ADMIN = gql`
	query GetAllReturnsByAdmin($input: AllReturnsInquiry!) {
		getAllReturnsByAdmin(input: $input) {
			list {
				_id
				returnStatus
				returnReason
				returnDesc
				returnQuantity
				returnAmount
				memberId
				sellerId
				createdAt
				memberData {
					_id
					memberNick
				}
				productData {
					_id
					productTitle
					productImages
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
	query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
		getAllBoardArticlesByAdmin(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				memberData {
					_id
					memberNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
