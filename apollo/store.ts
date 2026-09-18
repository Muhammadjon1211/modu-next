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

/** how many in-app page changes happened this visit — 0 means a back step would leave the site */
export const navDepthVar = makeVar<number>(0);
