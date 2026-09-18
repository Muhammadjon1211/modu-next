import typography from './typography';
import shadow from './shadow';

export const light = {
	palette: {
		mode: 'light',
		primary: {
			main: '#111111',
			contrastText: '#ffffff',
		},
		secondary: {
			main: '#ff4d2e',
			contrastText: '#ffffff',
		},
		success: {
			main: '#1f9d55',
		},
		text: {
			primary: '#111111',
			secondary: '#8a8a8a',
		},
		background: {
			default: '#ffffff',
			paper: '#ffffff',
		},
		divider: '#ececec',
	},
	shape: {
		borderRadius: 10,
	},
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				body: { background: '#ffffff' },
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: {
				root: { borderRadius: 999, padding: '10px 22px', boxShadow: 'none' },
				sizeSmall: { padding: '6px 14px' },
				sizeLarge: { padding: '14px 30px', fontSize: '15px' },
			},
		},
		MuiIconButton: {
			styleOverrides: {
				root: { borderRadius: 999 },
			},
		},
		MuiBox: {
			styleOverrides: {
				root: { padding: 0 },
			},
		},
		MuiList: {
			styleOverrides: {
				root: { padding: 0 },
			},
		},
		MuiOutlinedInput: {
			styleOverrides: {
				root: {
					borderRadius: 10,
					background: '#ffffff',
					'& .MuiOutlinedInput-notchedOutline': { borderColor: '#e4e4e4' },
					'&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bdbdbd' },
				},
				input: { padding: '13px 14px' },
				inputSizeSmall: { padding: '9px 12px' },
			},
		},
		MuiChip: {
			styleOverrides: {
				root: { borderRadius: 999, fontWeight: 600 },
				outlined: { borderColor: '#e4e4e4' },
			},
		},
		MuiPaper: {
			defaultProps: { elevation: 0 },
			styleOverrides: {
				root: { backgroundImage: 'none' },
			},
		},
		MuiMenu: {
			styleOverrides: {
				paper: { border: '1px solid #ececec', boxShadow: '0 8px 24px rgba(17, 17, 17, 0.1)' },
			},
		},
		MuiTab: {
			styleOverrides: {
				root: { textTransform: 'none', fontWeight: 700, minHeight: 44 },
			},
		},
		MuiTableCell: {
			styleOverrides: {
				root: { borderColor: '#f0f0f0' },
				head: { fontWeight: 700, color: '#8a8a8a', fontSize: '13px' },
			},
		},
		MuiPaginationItem: {
			styleOverrides: {
				root: { fontWeight: 600 },
			},
		},
		MuiDialog: {
			styleOverrides: {
				paper: { borderRadius: 16 },
			},
		},
	},
	shadows: shadow,
	typography,
};
