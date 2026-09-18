import React, { FormEvent, useEffect, useState } from 'react';
import { NextPage } from 'next';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { Avatar, Button, Collapse, IconButton, InputAdornment, Stack, TextField } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import withAdminLayout from '../../../libs/components/layout/LayoutAdmin';
import { userVar } from '../../../apollo/store';
import { GET_ALL_MEMBERS_BY_ADMIN } from '../../../apollo/admin/query';
import { CREATE_ADMIN_BY_ADMIN } from '../../../apollo/admin/mutation';
import { UPDATE_MY_CREDENTIALS } from '../../../apollo/user/mutation';
import { updateStorage, updateUserInfo } from '../../../libs/auth';
import { Member } from '../../../libs/types/member/member';
import { MemberStatus, MemberType } from '../../../libs/enums/member.enum';
import { Direction } from '../../../libs/enums/common.enum';
import { formatDate, getMemberImage } from '../../../libs/utils';
import { sweetErrorHandlingForAdmin, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from '../../../libs/sweetAlert';
import { T } from '../../../libs/types/common';

export const getStaticProps = async ({ locale }: any) => ({
	props: {
		...(await serverSideTranslations(locale, ['common'])),
	},
});

const adminsInput = {
	page: 1,
	limit: 50,
	sort: 'createdAt',
	direction: Direction.ASC,
	// deleted admins can no longer sign in, so they are not listed
	search: { memberType: MemberType.ADMIN, memberStatus: MemberStatus.ACTIVE },
};

const emptyAccount = { memberNick: '', newPassword: '', confirmPassword: '', currentPassword: '' };
const emptyAdmin = { memberNick: '', memberPhone: '', memberPassword: '' };

/** a password field with its own show / hide eye */
const PasswordField = (props: {
	label: string;
	value: string;
	onChange: (v: string) => void;
	autoComplete: string;
}) => {
	const [show, setShow] = useState<boolean>(false);
	return (
		<TextField
			label={props.label}
			type={show ? 'text' : 'password'}
			value={props.value}
			onChange={(e) => props.onChange(e.target.value)}
			autoComplete={props.autoComplete}
			fullWidth
			InputProps={{
				endAdornment: (
					<InputAdornment position={'end'}>
						<IconButton onClick={() => setShow(!show)} edge={'end'} size={'small'}>
							{show ? <VisibilityOffOutlinedIcon fontSize={'small'} /> : <VisibilityOutlinedIcon fontSize={'small'} />}
						</IconButton>
					</InputAdornment>
				),
			}}
		/>
	);
};

const AdminSettings: NextPage = () => {
	const user = useReactiveVar(userVar);
	const [account, setAccount] = useState(emptyAccount);
	const [newAdmin, setNewAdmin] = useState(emptyAdmin);
	const [adminFormOpen, setAdminFormOpen] = useState<boolean>(false);
	const [admins, setAdmins] = useState<Member[]>([]);
	const [saving, setSaving] = useState<boolean>(false);
	const [creating, setCreating] = useState<boolean>(false);

	/** APOLLO REQUESTS **/
	const [updateMyCredentials] = useMutation(UPDATE_MY_CREDENTIALS);
	const [createAdminByAdmin] = useMutation(CREATE_ADMIN_BY_ADMIN);

	const { refetch } = useQuery(GET_ALL_MEMBERS_BY_ADMIN, {
		fetchPolicy: 'network-only',
		variables: { input: adminsInput },
		notifyOnNetworkStatusChange: true,
		onCompleted: (data: T) => setAdmins(data?.getAllMembersByAdmin?.list ?? []),
	});

	/** LIFECYCLES **/
	useEffect(() => {
		if (user.memberNick) setAccount((prev) => ({ ...prev, memberNick: prev.memberNick || user.memberNick }));
	}, [user.memberNick]);

	/** HANDLERS **/
	const saveAccountHandler = async (e: FormEvent) => {
		e.preventDefault();
		const nick = account.memberNick.trim();
		if (!account.currentPassword) return sweetMixinErrorAlert('Enter your current password');
		if (account.newPassword !== account.confirmPassword) return sweetMixinErrorAlert('New passwords do not match');
		if (nick === user.memberNick && !account.newPassword) return sweetMixinErrorAlert('Nothing to change!');

		try {
			setSaving(true);
			const input: T = { currentPassword: account.currentPassword };
			if (nick !== user.memberNick) input.memberNick = nick;
			if (account.newPassword) input.newPassword = account.newPassword;

			const { data } = await updateMyCredentials({ variables: { input } });
			const token = data?.updateMyCredentials?.accessToken;
			// the token carries the nick, so swap it in or the header keeps the old name
			if (token) {
				updateStorage({ jwtToken: token });
				updateUserInfo(token);
			}
			setAccount({ ...emptyAccount, memberNick: data?.updateMyCredentials?.memberNick ?? nick });
			refetch({ input: adminsInput }).then();
			await sweetTopSmallSuccessAlert('Saved', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		} finally {
			setSaving(false);
		}
	};

	const createAdminHandler = async (e: FormEvent) => {
		e.preventDefault();
		const input = {
			memberNick: newAdmin.memberNick.trim(),
			memberPhone: newAdmin.memberPhone.trim(),
			memberPassword: newAdmin.memberPassword,
		};
		if (!input.memberNick || !input.memberPhone || !input.memberPassword)
			return sweetMixinErrorAlert('Please fill all fields');

		try {
			setCreating(true);
			await createAdminByAdmin({ variables: { input } });
			setNewAdmin(emptyAdmin);
			setAdminFormOpen(false);
			await refetch({ input: adminsInput });
			await sweetTopSmallSuccessAlert('Admin added', 800);
		} catch (err: any) {
			sweetErrorHandlingForAdmin(err).then();
		} finally {
			setCreating(false);
		}
	};

	return (
		<Stack className={'admin-page admin-settings'}>
			<h2 className={'admin-title'}>Settings</h2>

			<Stack className={'settings-grid'}>
				<form className={'settings-card'} onSubmit={saveAccountHandler}>
					<Stack className={'card-head'}>
						<Avatar src={getMemberImage(user.memberImage)} />
						<Stack>
							<strong>{user.memberNick}</strong>
							<span>Sign-in details</span>
						</Stack>
					</Stack>
					<TextField
						label={'Nickname'}
						value={account.memberNick}
						onChange={(e) => setAccount({ ...account, memberNick: e.target.value })}
						inputProps={{ maxLength: 12 }}
						autoComplete={'username'}
						fullWidth
					/>
					<Stack className={'field-pair'}>
						<PasswordField
							label={'New password'}
							value={account.newPassword}
							onChange={(v) => setAccount({ ...account, newPassword: v })}
							autoComplete={'new-password'}
						/>
						<PasswordField
							label={'Confirm'}
							value={account.confirmPassword}
							onChange={(v) => setAccount({ ...account, confirmPassword: v })}
							autoComplete={'new-password'}
						/>
					</Stack>
					<Stack className={'divider'} />
					<PasswordField
						label={'Current password'}
						value={account.currentPassword}
						onChange={(v) => setAccount({ ...account, currentPassword: v })}
						autoComplete={'current-password'}
					/>
					<Button type={'submit'} variant={'contained'} size={'large'} disabled={saving}>
						Save
					</Button>
				</form>

				<Stack className={'settings-card'}>
					<Stack className={'card-head spread'}>
						<strong>
							Admins <em>{admins.length}</em>
						</strong>
						<Button
							variant={adminFormOpen ? 'outlined' : 'contained'}
							size={'small'}
							startIcon={adminFormOpen ? undefined : <PersonAddAlt1RoundedIcon />}
							onClick={() => setAdminFormOpen(!adminFormOpen)}
						>
							{adminFormOpen ? 'Cancel' : 'Add admin'}
						</Button>
					</Stack>

					<Collapse in={adminFormOpen} unmountOnExit>
						<form className={'add-admin-form'} onSubmit={createAdminHandler}>
							<TextField
								label={'Nickname'}
								value={newAdmin.memberNick}
								onChange={(e) => setNewAdmin({ ...newAdmin, memberNick: e.target.value })}
								inputProps={{ maxLength: 12 }}
								autoComplete={'off'}
								fullWidth
							/>
							<TextField
								label={'Phone'}
								value={newAdmin.memberPhone}
								onChange={(e) => setNewAdmin({ ...newAdmin, memberPhone: e.target.value })}
								autoComplete={'off'}
								fullWidth
							/>
							<PasswordField
								label={'Password'}
								value={newAdmin.memberPassword}
								onChange={(v) => setNewAdmin({ ...newAdmin, memberPassword: v })}
								autoComplete={'new-password'}
							/>
							<Button type={'submit'} variant={'contained'} disabled={creating}>
								Create admin
							</Button>
						</form>
					</Collapse>

					<Stack className={'admin-list'}>
						{admins.map((admin) => (
							<Stack key={admin._id} className={'admin-row'}>
								<Avatar src={getMemberImage(admin.memberImage)} />
								<Stack className={'who'}>
									<strong>
										{admin.memberNick}
										{admin._id === user._id && <span className={'you-tag'}>You</span>}
									</strong>
									<span>{admin.memberPhone}</span>
								</Stack>
								<span className={'since'}>{formatDate(admin.createdAt)}</span>
							</Stack>
						))}
					</Stack>
				</Stack>
			</Stack>
		</Stack>
	);
};

export default withAdminLayout(AdminSettings);
