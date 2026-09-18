import React, { ChangeEvent, useState } from 'react';
import { useTranslation } from 'next-i18next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, CircularProgress, IconButton, Stack, TextField } from '@mui/material';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import { GET_MEMBER } from '../../../apollo/user/query';
import { IMAGE_UPLOADER, UPDATE_MEMBER } from '../../../apollo/user/mutation';
import { userVar } from '../../../apollo/store';
import { updateStorage, updateUserInfo } from '../../auth';
import { MemberUpdate } from '../../types/member/member.update';
import { MemberType } from '../../enums/member.enum';
import { getImageUrl, getMemberImage, imageFallbackHandler, prepareImages } from '../../utils';
import { sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../sweetAlert';
import { T } from '../../types/common';

const MyProfile = () => {
	const { t } = useTranslation('common');
	const user = useReactiveVar(userVar);
	const isSeller = user?.memberType === MemberType.SELLER;
	const [form, setForm] = useState<MemberUpdate>({ _id: '' });
	const [password, setPassword] = useState<string>('');
	const [saving, setSaving] = useState<boolean>(false);
	const [uploading, setUploading] = useState<string>('');

	/** APOLLO REQUESTS **/
	const [updateMember] = useMutation(UPDATE_MEMBER);
	const [imageUploader] = useMutation(IMAGE_UPLOADER);

	const { loading } = useQuery(GET_MEMBER, {
		fetchPolicy: 'network-only',
		variables: { input: user?._id },
		skip: !user?._id,
		onCompleted: (data: T) => {
			const member = data?.getMember;
			if (!member) return;
			setForm({
				_id: member._id,
				memberNick: member.memberNick,
				memberPhone: member.memberPhone,
				memberFullName: member.memberFullName ?? '',
				memberImage: member.memberImage ?? '',
				memberAddress: member.memberAddress ?? '',
				memberDesc: member.memberDesc ?? '',
				memberShopName: member.memberShopName ?? '',
				memberShopBanner: member.memberShopBanner ?? '',
			});
		},
	});

	/** HANDLERS */
	const changeHandler = (name: keyof MemberUpdate, value: string) => setForm((prev) => ({ ...prev, [name]: value }));

	const uploadImageHandler = async (e: ChangeEvent<HTMLInputElement>, field: 'memberImage' | 'memberShopBanner') => {
		try {
			const files = e.target.files;
			if (!files?.length) return;
			const [file] = await prepareImages(files);

			setUploading(field);
			const { data } = await imageUploader({ variables: { file, target: 'member' } });
			setForm((prev) => ({ ...prev, [field]: data?.imageUploader }));
		} catch (err: any) {
			console.log('ERROR, uploadImageHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setUploading('');
			e.target.value = '';
		}
	};

	const saveHandler = async () => {
		try {
			if (!form.memberNick || !form.memberPhone) throw new Error(t('Please fulfill all inputs!'));

			const input: T = { ...form };
			if (password) input.memberPassword = password;
			if (!isSeller) {
				delete input.memberShopName;
				delete input.memberShopBanner;
			}

			setSaving(true);
			const { data } = await updateMember({ variables: { input } });
			const token = data?.updateMember?.accessToken;
			if (token) {
				updateStorage({ jwtToken: token });
				updateUserInfo(token);
			}
			setPassword('');
			await sweetTopSmallSuccessAlert(t('Saved'), 1000);
		} catch (err: any) {
			console.log('ERROR, saveHandler:', err.message);
			sweetMixinErrorAlert(err.message).then();
		} finally {
			setSaving(false);
		}
	};

	if (loading && !form._id) {
		return (
			<Stack className={'loading-box'}>
				<CircularProgress color={'inherit'} />
			</Stack>
		);
	}

	return (
		<Stack className={'my-profile'}>
			<h2 className={'my-title'}>{t('Profile')}</h2>

			{isSeller && (
				<Stack className={'banner-edit'}>
					{form.memberShopBanner ? (
						<img
							src={getImageUrl(form.memberShopBanner, '/img/banner/shop.svg')}
							alt={''}
							onError={imageFallbackHandler('/img/banner/shop.svg')}
						/>
					) : (
						<span className={'banner-fill'} />
					)}
					<Button component={'label'} variant={'contained'} size={'small'} className={'banner-btn'}>
						{uploading === 'memberShopBanner' ? <CircularProgress size={16} color={'inherit'} /> : t('Change cover')}
						<input
							hidden
							type={'file'}
							accept={'image/png,image/jpeg'}
							onChange={(e) => uploadImageHandler(e, 'memberShopBanner')}
						/>
					</Button>
				</Stack>
			)}

			<Stack className={'avatar-edit'}>
				<Avatar src={getMemberImage(form.memberImage)} />
				<IconButton component={'label'} className={'camera-btn'}>
					{uploading === 'memberImage' ? <CircularProgress size={18} color={'inherit'} /> : <PhotoCameraOutlinedIcon />}
					<input
						hidden
						type={'file'}
						accept={'image/png,image/jpeg'}
						onChange={(e) => uploadImageHandler(e, 'memberImage')}
					/>
				</IconButton>
			</Stack>

			<Stack className={'form-grid'}>
				<TextField
					label={t('Nickname')}
					value={form.memberNick ?? ''}
					onChange={(e) => changeHandler('memberNick', e.target.value)}
					inputProps={{ minLength: 3, maxLength: 12 }}
				/>
				<TextField
					label={t('Phone')}
					value={form.memberPhone ?? ''}
					onChange={(e) => changeHandler('memberPhone', e.target.value)}
				/>
				<TextField
					label={t('Full name')}
					value={form.memberFullName ?? ''}
					onChange={(e) => changeHandler('memberFullName', e.target.value)}
				/>
				<TextField
					label={t('New password')}
					type={'password'}
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					inputProps={{ minLength: 5, maxLength: 12 }}
					autoComplete={'new-password'}
				/>
				{isSeller && (
					<TextField
						label={t('Shop name')}
						value={form.memberShopName ?? ''}
						onChange={(e) => changeHandler('memberShopName', e.target.value)}
					/>
				)}
				<TextField
					className={isSeller ? '' : 'wide'}
					label={t('Address')}
					value={form.memberAddress ?? ''}
					onChange={(e) => changeHandler('memberAddress', e.target.value)}
				/>
				<TextField
					className={'wide'}
					label={t('About')}
					value={form.memberDesc ?? ''}
					onChange={(e) => changeHandler('memberDesc', e.target.value)}
					multiline
					minRows={3}
				/>
			</Stack>

			<Stack className={'form-actions'}>
				<Button variant={'contained'} size={'large'} onClick={saveHandler} disabled={saving || !!uploading}>
					{t('Save')}
				</Button>
			</Stack>
		</Stack>
	);
};

export default MyProfile;
