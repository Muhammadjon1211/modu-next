import { MemberStatus, MemberType } from '../../enums/member.enum';

export interface MemberUpdate {
	_id: string;
	memberType?: MemberType;
	memberStatus?: MemberStatus;
	memberNick?: string;
	memberPassword?: string;
	memberPhone?: string;
	memberFullName?: string;
	memberImage?: string;
	memberAddress?: string;
	memberDesc?: string;
	memberShopName?: string;
	memberShopBanner?: string;
	memberSocials?: string[];
}
