import React, { ReactNode } from 'react';
import { Stack } from '@mui/material';
import RadioButtonCheckedRoundedIcon from '@mui/icons-material/RadioButtonCheckedRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';

interface SavedOptionType {
	selected: boolean;
	onSelect: () => void;
	title: ReactNode;
	lines?: ReactNode[];
	badge?: string;
	actions?: ReactNode;
}

/** one selectable saved address / payment method — also the "new ..." choice */
const SavedOption = (props: SavedOptionType) => {
	const { selected, onSelect, title, lines = [], badge, actions } = props;

	return (
		<Stack
			className={`saved-option ${selected ? 'selected' : ''}`}
			role={'radio'}
			aria-checked={selected}
			tabIndex={0}
			onClick={onSelect}
			onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect()}
		>
			{selected ? (
				<RadioButtonCheckedRoundedIcon className={'radio'} />
			) : (
				<RadioButtonUncheckedRoundedIcon className={'radio'} />
			)}
			<Stack className={'option-body'}>
				<Stack className={'option-title'}>
					<strong>{title}</strong>
					{badge && <span className={'option-badge'}>{badge}</span>}
				</Stack>
				{lines.map((line, index) => (
					<span key={index} className={'option-line'}>
						{line}
					</span>
				))}
			</Stack>
			{actions && (
				<Stack className={'option-actions'} onClick={(e) => e.stopPropagation()}>
					{actions}
				</Stack>
			)}
		</Stack>
	);
};

export default SavedOption;
