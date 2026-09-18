import { gql } from '@apollo/client';

/**************************
 *         MEMBER         *
 *************************/

export const SIGN_UP = gql`
	mutation Signup($input: MemberInput!) {
		signup(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			memberImage
			accessToken
		}
	}
`;

export const LOGIN = gql`
	mutation Login($input: LoginInput!) {
		login(input: $input) {
			_id
			memberType
			memberStatus
			memberNick
			memberImage
			accessToken
		}
	}
`;

export const UPDATE_MEMBER = gql`
	mutation UpdateMember($input: MemberUpdate!) {
		updateMember(input: $input) {
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
			memberSocials
			accessToken
		}
	}
`;

export const LIKE_TARGET_MEMBER = gql`
	mutation LikeTargetMember($input: String!) {
		likeTargetMember(memberId: $input) {
			_id
			memberLikes
		}
	}
`;

export const IMAGE_UPLOADER = gql`
	mutation ImageUploader($file: Upload!, $target: String!) {
		imageUploader(file: $file, target: $target)
	}
`;

export const IMAGES_UPLOADER = gql`
	mutation ImagesUploader($files: [Upload!]!, $target: String!) {
		imagesUploader(files: $files, target: $target)
	}
`;

/**************************
 *        PRODUCT         *
 *************************/

export const CREATE_PRODUCT = gql`
	mutation CreateProduct($input: ProductInput!) {
		createProduct(input: $input) {
			_id
			productTitle
			productStatus
		}
	}
`;

export const UPDATE_PRODUCT = gql`
	mutation UpdateProduct($input: ProductUpdate!) {
		updateProduct(input: $input) {
			_id
			productTitle
			productStatus
			productStock
		}
	}
`;

export const LIKE_TARGET_PRODUCT = gql`
	mutation LikeTargetProduct($input: String!) {
		likeTargetProduct(productId: $input) {
			_id
			productLikes
		}
	}
`;

/**************************
 *         ORDER          *
 *************************/

export const ADD_TO_CART = gql`
	mutation AddToCart($input: OrderItemInput!) {
		addToCart(input: $input) {
			_id
			orderTotal
			orderItems {
				_id
				productId
				itemQuantity
			}
		}
	}
`;

export const REMOVE_FROM_CART = gql`
	mutation RemoveFromCart($input: String!) {
		removeFromCart(orderItemId: $input) {
			_id
			orderTotal
			orderItems {
				_id
				productId
				itemQuantity
			}
		}
	}
`;

export const UPDATE_CART_ITEM = gql`
	mutation UpdateCartItem($input: CartItemUpdate!) {
		updateCartItem(input: $input) {
			_id
			orderTotal
			orderItems {
				_id
				itemQuantity
			}
		}
	}
`;

export const CREATE_ORDER = gql`
	mutation CreateOrder($input: OrderInput!) {
		createOrder(input: $input) {
			_id
			orderStatus
			orderTotal
		}
	}
`;

export const UPDATE_ORDER = gql`
	mutation UpdateOrder($input: OrderUpdate!) {
		updateOrder(input: $input) {
			_id
			orderStatus
		}
	}
`;

/**************************
 *         RETURN         *
 *************************/

export const REQUEST_RETURN = gql`
	mutation RequestReturn($input: ReturnInput!) {
		requestReturn(input: $input) {
			_id
			returnStatus
			returnAmount
		}
	}
`;

export const CANCEL_RETURN = gql`
	mutation CancelReturn($input: String!) {
		cancelReturn(returnId: $input) {
			_id
			returnStatus
		}
	}
`;

export const UPDATE_RETURN = gql`
	mutation UpdateReturn($input: ReturnUpdate!) {
		updateReturn(input: $input) {
			_id
			returnStatus
		}
	}
`;

/**************************
 *      BOARD-ARTICLE     *
 *************************/

export const CREATE_BOARD_ARTICLE = gql`
	mutation CreateBoardArticle($input: BoardArticleInput!) {
		createBoardArticle(input: $input) {
			_id
			articleCategory
			articleTitle
		}
	}
`;

export const UPDATE_BOARD_ARTICLE = gql`
	mutation UpdateBoardArticle($input: BoardArticleUpdate!) {
		updateBoardArticle(input: $input) {
			_id
			articleStatus
			articleTitle
		}
	}
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
	mutation LikeTargetBoardArticle($input: String!) {
		likeTargetBoardArticle(articleId: $input) {
			_id
			articleLikes
		}
	}
`;

/**************************
 *         COMMENT        *
 *************************/

export const CREATE_COMMENT = gql`
	mutation CreateComment($input: CommentInput!) {
		createComment(input: $input) {
			_id
			commentContent
			commentRating
		}
	}
`;

export const UPDATE_COMMENT = gql`
	mutation UpdateComment($input: CommentUpdate!) {
		updateComment(input: $input) {
			_id
			commentStatus
			commentContent
		}
	}
`;

/**************************
 *         FOLLOW         *
 *************************/

export const SUBSCRIBE = gql`
	mutation Subscribe($input: String!) {
		subscribe(input: $input) {
			_id
			followingId
			followerId
		}
	}
`;

export const UNSUBSCRIBE = gql`
	mutation Unsubscribe($input: String!) {
		unsubscribe(input: $input) {
			_id
			followingId
			followerId
		}
	}
`;

/**************************
 *   ADDRESS & PAYMENT    *
 *************************/

export const CREATE_ADDRESS = gql`
	mutation CreateAddress($input: AddressInput!) {
		createAddress(input: $input) {
			_id
			isDefault
		}
	}
`;

export const UPDATE_ADDRESS = gql`
	mutation UpdateAddress($input: AddressUpdate!) {
		updateAddress(input: $input) {
			_id
			isDefault
		}
	}
`;

export const REMOVE_ADDRESS = gql`
	mutation RemoveAddress($input: String!) {
		removeAddress(addressId: $input) {
			_id
		}
	}
`;

export const CREATE_PAYMENT_METHOD = gql`
	mutation CreatePaymentMethod($input: PaymentInput!) {
		createPaymentMethod(input: $input) {
			_id
			provider
			last4
			isDefault
		}
	}
`;

export const UPDATE_PAYMENT_METHOD = gql`
	mutation UpdatePaymentMethod($input: PaymentMethodUpdate!) {
		updatePaymentMethod(input: $input) {
			_id
			isDefault
		}
	}
`;

export const REMOVE_PAYMENT_METHOD = gql`
	mutation RemovePaymentMethod($input: String!) {
		removePaymentMethod(paymentId: $input) {
			_id
		}
	}
`;
