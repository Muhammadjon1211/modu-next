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
				memberShopBanner
				memberProducts
				memberArticles
				memberFollowers
				memberLikes
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

export const GET_MEMBER_BY_ADMIN = gql`
	query GetMemberByAdmin($input: String!) {
		getMemberByAdmin(memberId: $input) {
			_id
			memberType
			memberStatus
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberShopName
			memberShopBanner
			memberProducts
			memberFollowers
			memberLikes
			memberViews
			memberWarnings
			memberBlocks
			createdAt
		}
	}
`;

/**************************
 *         STORE          *
 *************************/

export const GET_STORE_SUMMARY_BY_ADMIN = gql`
	query GetStoreSummaryByAdmin($input: String!) {
		getStoreSummaryByAdmin(sellerId: $input) {
			orderCount
			unitsSold
			grossSales
			customerCount
		}
	}
`;

export const GET_STORE_CUSTOMERS_BY_ADMIN = gql`
	query GetStoreCustomersByAdmin($input: StoreCustomersInquiry!) {
		getStoreCustomersByAdmin(input: $input) {
			list {
				_id
				orderCount
				unitsBought
				totalSpent
				lastOrderAt
				memberData {
					_id
					memberNick
					memberFullName
					memberImage
					memberPhone
					memberStatus
				}
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
					itemPrice
					itemDiscount
					itemSize
					itemColor
					productId
					sellerId
				}
				productData {
					_id
					productTitle
					productImages
				}
				memberData {
					_id
					memberNick
					memberImage
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
