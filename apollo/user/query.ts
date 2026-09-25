import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const GET_SELLERS = gql`
	query GetSellers($input: SellersInquiry!) {
		getSellers(input: $input) {
			list {
				_id
				memberType
				memberStatus
				memberNick
				memberFullName
				memberImage
				memberDesc
				memberShopName
				memberShopBanner
				memberProducts
				memberFollowers
				memberFollowings
				memberLikes
				memberViews
				memberSales
				memberRank
				createdAt
				updatedAt
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER = gql`
	query GetMember($input: String!) {
		getMember(memberId: $input) {
			_id
			memberType
			memberStatus
			memberAuthType
			memberPhone
			memberNick
			memberFullName
			memberImage
			memberAddress
			memberDesc
			memberShopName
			memberShopBanner
			memberSocials
			memberProducts
			memberArticles
			memberFollowers
			memberFollowings
			memberPoints
			memberLikes
			memberViews
			memberComments
			memberOrders
			memberSales
			memberRank
			createdAt
			updatedAt
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
			meFollowed {
				followerId
				followingId
				myFollowing
			}
		}
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const GET_PRODUCTS = gql`
	query GetProducts($input: ProductsInquiry!) {
		getProducts(input: $input) {
			list {
				_id
				productCategory
				productGroup
				productStatus
				productGender
				productBrand
				productTitle
				productPrice
				productDiscount
				productStock
				productSizes
				productColors
				productImages
				productOnSale
				productFreeShipping
				productViews
				productLikes
				productComments
				productSales
				productRating
				productRatingCount
				productRank
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberType
					memberNick
					memberImage
					memberShopName
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meRecommended
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PRODUCT = gql`
	query GetProduct($input: String!) {
		getProduct(productId: $input) {
			_id
			productCategory
			productGroup
			productStatus
			productGender
			productBrand
			productTitle
			productPrice
			productDiscount
			productStock
			productSizes
			productColors
			productSeasons
			productFit
			productImages
			productDesc
			productMaterial
			productTags
			productOnSale
			productFreeShipping
			productViews
			productLikes
			productComments
			productSales
			productRating
			productRatingCount
			productRank
			memberId
			soldOutAt
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberNick
				memberImage
				memberShopName
				memberProducts
				memberFollowers
				memberSales
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

export const GET_RELATED_PRODUCTS = gql`
	query GetRelatedProducts($input: String!, $limit: Int) {
		getRelatedProducts(productId: $input, limit: $limit) {
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
				productOnSale
				productFreeShipping
				productLikes
				productSales
				productRating
				productRatingCount
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberShopName
				}
				meRecommended
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_RECOMMENDATIONS = gql`
	query GetRecommendations($limit: Int) {
		getRecommendations(limit: $limit) {
			list {
				_id
				productCategory
				productGroup
				productStatus
				productGender
				productBrand
				productTitle
				productPrice
				productDiscount
				productStock
				productImages
				productOnSale
				productFreeShipping
				productViews
				productLikes
				productSales
				productRating
				productRatingCount
				memberId
				createdAt
				memberData {
					_id
					memberNick
					memberShopName
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
				meRecommended
			}
			personalized
		}
	}
`;

export const GET_FAVORITES = gql`
	query GetFavorites($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
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
				productOnSale
				productFreeShipping
				productLikes
				productSales
				productRating
				productRatingCount
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

export const GET_VISITED = gql`
	query GetVisited($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
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
				productOnSale
				productFreeShipping
				productLikes
				productSales
				productRating
				productRatingCount
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

export const GET_SELLER_PRODUCTS = gql`
	query GetSellerProducts($input: SellerProductsInquiry!) {
		getSellerProducts(input: $input) {
			list {
				_id
				productCategory
				productStatus
				productGender
				productBrand
				productTitle
				productPrice
				productDiscount
				productStock
				productImages
				productOnSale
				productViews
				productLikes
				productSales
				productRating
				productRatingCount
				soldOutAt
				createdAt
				updatedAt
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

export const GET_MY_CART = gql`
	query GetMyCart {
		getMyCart {
			_id
			orderStatus
			orderSubTotal
			orderDelivery
			orderTotal
			memberId
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
				orderId
			}
			productData {
				_id
				productCategory
				productStatus
				productBrand
				productTitle
				productPrice
				productDiscount
				productStock
				productImages
				productSizes
				productColors
			}
		}
	}
`;

export const GET_MY_ORDERS = gql`
	query GetMyOrders($input: OrdersInquiry!) {
		getMyOrders(input: $input) {
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
				orderShipping {
					recipientName
					recipientPhone
					addressLine1
					addressLine2
					city
					postalCode
				}
				orderPayment {
					paymentType
					holderName
					provider
					last4
				}
				orderItems {
					_id
					itemQuantity
					itemPrice
					itemDiscount
					itemSize
					itemColor
					productId
					sellerId
					orderId
				}
				productData {
					_id
					productBrand
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

export const GET_SELLER_ORDERS = gql`
	query GetSellerOrders($input: OrdersInquiry!) {
		getSellerOrders(input: $input) {
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
				orderShipping {
					recipientName
					recipientPhone
					addressLine1
					addressLine2
					city
					postalCode
				}
				orderItems {
					_id
					itemQuantity
					itemPrice
					itemDiscount
					itemSize
					itemColor
					productId
					sellerId
					orderId
				}
				productData {
					_id
					productBrand
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

export const GET_MY_RETURNS = gql`
	query GetMyReturns($input: ReturnsInquiry!) {
		getMyReturns(input: $input) {
			list {
				_id
				returnStatus
				returnReason
				returnDesc
				returnImages
				returnQuantity
				returnAmount
				memberId
				sellerId
				orderId
				orderItemId
				productId
				approvedAt
				rejectedAt
				completedAt
				cancelledAt
				createdAt
				updatedAt
				productData {
					_id
					productBrand
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

export const GET_SELLER_RETURNS = gql`
	query GetSellerReturns($input: ReturnsInquiry!) {
		getSellerReturns(input: $input) {
			list {
				_id
				returnStatus
				returnReason
				returnDesc
				returnImages
				returnQuantity
				returnAmount
				memberId
				sellerId
				orderId
				orderItemId
				productId
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberImage
				}
				productData {
					_id
					productBrand
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

export const CHECK_RETURN_ELIGIBILITY = gql`
	query CheckReturnEligibility($input: String!) {
		checkReturnEligibility(orderItemId: $input) {
			eligible
			quantityReturnable
			windowClosesAt
			reason
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const GET_BOARD_ARTICLES = gql`
	query GetBoardArticles($input: BoardArticlesInquiry!) {
		getBoardArticles(input: $input) {
			list {
				_id
				articleCategory
				articleStatus
				articleTitle
				articleContent
				articleImage
				articleViews
				articleLikes
				articleComments
				memberId
				createdAt
				updatedAt
				memberData {
					_id
					memberNick
					memberImage
				}
				meLiked {
					memberId
					likeRefId
					myFavorite
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_BOARD_ARTICLE = gql`
	query GetBoardArticle($input: String!) {
		getBoardArticle(articleId: $input) {
			_id
			articleCategory
			articleStatus
			articleTitle
			articleContent
			articleImage
			articleViews
			articleLikes
			articleComments
			memberId
			createdAt
			updatedAt
			memberData {
				_id
				memberType
				memberNick
				memberImage
				memberShopName
			}
			meLiked {
				memberId
				likeRefId
				myFavorite
			}
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const GET_COMMENTS = gql`
	query GetComments($input: CommentsInquiry!) {
		getComments(input: $input) {
			list {
				_id
				commentStatus
				commentGroup
				commentContent
				commentRefId
				commentRating
				isSellerReply
				memberId
				createdAt
				updatedAt
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
 *         FOLLOW         *
 *************************/

export const GET_MEMBER_FOLLOWERS = gql`
	query GetMemberFollowers($input: FollowersInquiry!) {
		getMemberFollowers(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				meFollowed {
					followerId
					followingId
				}
				followerData {
					_id
					memberType
					memberNick
					memberImage
					memberShopName
					memberFollowers
					memberFollowings
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_MEMBER_FOLLOWINGS = gql`
	query GetMemberFollowings($input: FollowingsInquiry!) {
		getMemberFollowings(input: $input) {
			list {
				_id
				followingId
				followerId
				createdAt
				meFollowed {
					followerId
					followingId
				}
				followingData {
					_id
					memberType
					memberNick
					memberImage
					memberShopName
					memberFollowers
					memberFollowings
				}
			}
			metaCounter {
				total
			}
		}
	}
`;

/**************************
 *   ADDRESS & PAYMENT    *
 *************************/

export const GET_MY_ADDRESSES = gql`
	query GetMyAddresses {
		getMyAddresses {
			_id
			recipientName
			recipientPhone
			addressLine1
			addressLine2
			city
			postalCode
			isDefault
		}
	}
`;

export const GET_MY_PAYMENT_METHODS = gql`
	query GetMyPaymentMethods {
		getMyPaymentMethods {
			_id
			paymentType
			holderName
			provider
			last4
			expMonth
			expYear
			isDefault
		}
	}
`;
