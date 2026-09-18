import { MeFollowed, MeLiked, Member, TotalCounter } from '../member/member';

export interface Follower {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	followerData?: Member;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface Followers {
	list: Follower[];
	metaCounter: TotalCounter[];
}

export interface Following {
	_id: string;
	followingId: string;
	followerId: string;
	createdAt: Date;
	updatedAt: Date;
	/** from aggregation **/
	followingData?: Member;
	meLiked?: MeLiked[];
	meFollowed?: MeFollowed[];
}

export interface Followings {
	list: Following[];
	metaCounter: TotalCounter[];
}
