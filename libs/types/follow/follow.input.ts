interface FollowerSearch {
	followerId: string;
}

interface FollowingSearch {
	followingId: string;
}

export interface FollowingsInquiry {
	page: number;
	limit: number;
	search: FollowerSearch;
}

export interface FollowersInquiry {
	page: number;
	limit: number;
	search: FollowingSearch;
}
