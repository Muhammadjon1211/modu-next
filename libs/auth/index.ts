import { jwtDecode } from 'jwt-decode';
import { initializeApollo } from '../../apollo/client';
import { cartCountVar, userVar } from '../../apollo/store';
import { CustomJwtPayload } from '../types/customJwtPayload';
import { sweetMixinErrorAlert } from '../sweetAlert';
import { LOGIN, SIGN_UP } from '../../apollo/user/mutation';
import { Message } from '../enums/common.enum';

export function getJwtToken(): any {
	if (typeof window !== 'undefined') {
		return localStorage.getItem('accessToken') ?? '';
	}
}

export function setJwtToken(token: string) {
	localStorage.setItem('accessToken', token);
}

export const logIn = async (nick: string, password: string): Promise<void> => {
	try {
		const { jwtToken } = await requestJwtToken({ nick, password });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('login err', err);
		logOut();
		throw new Error('Login Err');
	}
};

const requestJwtToken = async ({
	nick,
	password,
}: {
	nick: string;
	password: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: LOGIN,
			variables: { input: { memberNick: nick, memberPassword: password } },
			fetchPolicy: 'network-only',
		});

		const { accessToken } = result?.data?.login;
		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		switch (err.graphQLErrors?.[0]?.message) {
			case Message.NO_MEMBER_NICK:
				await sweetMixinErrorAlert(Message.NO_MEMBER_NICK);
				break;
			case Message.WRONG_PASSWORD:
				await sweetMixinErrorAlert(Message.WRONG_PASSWORD);
				break;
			case Message.BLOCKED_USER:
				await sweetMixinErrorAlert(Message.BLOCKED_USER);
				break;
			default:
				await sweetMixinErrorAlert(err.graphQLErrors?.[0]?.message ?? Message.SOMETHING_WENT_WRONG);
		}
		throw new Error('token error');
	}
};

export const signUp = async (nick: string, password: string, phone: string, type: string): Promise<void> => {
	try {
		const { jwtToken } = await requestSignUpJwtToken({ nick, password, phone, type });

		if (jwtToken) {
			updateStorage({ jwtToken });
			updateUserInfo(jwtToken);
		}
	} catch (err) {
		console.warn('signup err', err);
		logOut();
		throw new Error('Signup Err');
	}
};

const requestSignUpJwtToken = async ({
	nick,
	password,
	phone,
	type,
}: {
	nick: string;
	password: string;
	phone: string;
	type: string;
}): Promise<{ jwtToken: string }> => {
	const apolloClient = await initializeApollo();

	try {
		const result = await apolloClient.mutate({
			mutation: SIGN_UP,
			variables: {
				input: { memberNick: nick, memberPassword: password, memberPhone: phone, memberType: type },
			},
			fetchPolicy: 'network-only',
		});

		const { accessToken } = result?.data?.signup;
		return { jwtToken: accessToken };
	} catch (err: any) {
		console.log('request token err', err.graphQLErrors);
		const message = err.graphQLErrors?.[0]?.message;
		switch (true) {
			case message === Message.USED_MEMBER_NICK_OR_PHONE:
				await sweetMixinErrorAlert(Message.USED_MEMBER_NICK_OR_PHONE);
				break;
			case Array.isArray(message):
				await sweetMixinErrorAlert(message[0]);
				break;
			default:
				await sweetMixinErrorAlert(message ?? Message.SOMETHING_WENT_WRONG);
		}
		throw new Error('token error');
	}
};

export const updateStorage = ({ jwtToken }: { jwtToken: any }) => {
	setJwtToken(jwtToken);
	window.localStorage.setItem('login', Date.now().toString());
};

export const updateUserInfo = (jwtToken: any) => {
	if (!jwtToken) return false;

	const claims = jwtDecode<CustomJwtPayload>(jwtToken);
	userVar({
		_id: claims._id ?? '',
		memberNick: claims.memberNick ?? '',
		memberType: claims.memberType ?? '',
		memberStatus: claims.memberStatus ?? '',
		memberImage: claims.memberImage || '/img/profile/defaultUser.svg',
	});
};

export const logOut = () => {
	deleteStorage();
	deleteUserInfo();
	window.location.reload();
};

const deleteStorage = () => {
	localStorage.removeItem('accessToken');
	window.localStorage.setItem('logout', Date.now().toString());
};

const deleteUserInfo = () => {
	userVar({
		_id: '',
		memberNick: '',
		memberType: '',
		memberStatus: '',
		memberImage: '',
	});
	cartCountVar(0);
};
