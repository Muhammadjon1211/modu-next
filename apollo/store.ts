import { makeVar } from '@apollo/client';
import { CustomJwtPayload } from '../libs/types/customJwtPayload';

export const themeVar = makeVar({});

export const userVar = makeVar<CustomJwtPayload>({
	_id: '',
	memberNick: '',
	memberType: '',
	memberStatus: '',
	memberImage: '',
});

/** number of lines in the open cart — drives the header badge */
export const cartCountVar = makeVar<number>(0);
