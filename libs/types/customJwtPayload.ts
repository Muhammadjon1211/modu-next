import { JwtPayload } from 'jwt-decode';

export interface CustomJwtPayload extends JwtPayload {
	_id: string;
	memberNick: string;
	memberType: string;
	memberStatus: string;
	memberImage: string;
}
