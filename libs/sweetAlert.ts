import Swal, { SweetAlertIcon } from 'sweetalert2';
import { Messages } from './config';

/**
 * Every popup in the app goes through here, styled by the `.modu-swal` / `.modu-toast`
 * rules in scss/app.scss. Outcomes (saved, failed) are toasts that never block the page;
 * only questions that need an answer open a modal.
 */

/** line icons drawn to match the MUI rounded set used everywhere else */
const ICON_PATHS: Record<SweetAlertIcon, string> = {
	success: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
	error: '<path d="M12 5.5v8.5M12 18.5h.01"/>',
	warning: '<path d="M12 5.5v8.5M12 18.5h.01"/>',
	info: '<path d="M12 10.5v8M12 5.5h.01"/>',
	question: '<path d="M8.2 8.6a3.9 3.9 0 1 1 5.6 3.5c-1.1.5-1.8 1.5-1.8 2.7v.4M12 19h.01"/>',
};

const iconHtml = (icon: SweetAlertIcon) =>
	`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round">${ICON_PATHS[icon]}</svg>`;

const cleanMessage = (msg: string) => `${msg ?? ''}`.replace('Definer: ', '');

const modal = Swal.mixin({
	buttonsStyling: false,
	reverseButtons: true, // cancel on the left, the action on the right
	focusCancel: false,
	width: 400, // capped to the screen in scss (.modu-swal-popup max-width)
	showClass: { popup: 'modu-swal-in' },
	hideClass: { popup: 'modu-swal-out' },
	customClass: {
		container: 'modu-swal',
		popup: 'modu-swal-popup',
		icon: 'modu-swal-icon',
		title: 'modu-swal-title',
		htmlContainer: 'modu-swal-text',
		actions: 'modu-swal-actions',
		confirmButton: 'modu-swal-btn primary',
		cancelButton: 'modu-swal-btn ghost',
		timerProgressBar: 'modu-swal-progress',
	},
});

const toast = Swal.mixin({
	toast: true,
	position: 'top',
	showConfirmButton: false,
	showClass: { popup: 'modu-toast-in' },
	hideClass: { popup: 'modu-toast-out' },
	customClass: {
		container: 'modu-toast',
		popup: 'modu-toast-popup',
		icon: 'modu-toast-icon',
		title: 'modu-toast-title',
	},
	// hovering a toast holds it open long enough to read
	didOpen: (popup) => {
		popup.addEventListener('mouseenter', Swal.stopTimer);
		popup.addEventListener('mouseleave', Swal.resumeTimer);
	},
});

const showToast = (icon: SweetAlertIcon, msg: string, duration: number) =>
	toast.fire({ icon, iconHtml: iconHtml(icon), title: cleanMessage(msg), timer: duration });

export const sweetErrorHandling = async (err: any) => {
	await showToast('error', err?.message ?? Messages.error1, 3500);
};

export const sweetTopSuccessAlert = async (msg: string, duration: number = 2000) => {
	await showToast('success', msg, duration);
};

export const sweetContactAlert = async (msg: string, duration: number = 10000) => {
	await modal.fire({
		icon: 'info',
		iconHtml: iconHtml('info'),
		title: msg,
		showConfirmButton: false,
		showCloseButton: true,
		timer: duration,
		timerProgressBar: true,
	});
};

export const sweetConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		const response = await modal.fire({
			icon: 'question',
			iconHtml: iconHtml('question'),
			title: msg,
			showCancelButton: true,
			confirmButtonText: 'Confirm',
			cancelButtonText: 'Cancel',
		});
		resolve(!!response?.isConfirmed);
	});
};

export const sweetLoginConfirmAlert = (msg: string) => {
	return new Promise(async (resolve) => {
		const response = await modal.fire({
			icon: 'info',
			iconHtml: iconHtml('info'),
			title: msg,
			showCancelButton: true,
			confirmButtonText: 'Login',
			cancelButtonText: 'Not now',
		});
		resolve(!!response?.isConfirmed);
	});
};

export const sweetMixinErrorAlert = async (msg: string, duration: number = 3000) => {
	await showToast('error', msg, duration);
};

export const sweetMixinSuccessAlert = async (msg: string, duration: number = 2000) => {
	await showToast('success', msg, duration);
};

export const sweetBasicAlert = async (text: string) => {
	modal.fire({ icon: 'info', iconHtml: iconHtml('info'), title: text, confirmButtonText: 'OK' }).then();
};

export const sweetErrorHandlingForAdmin = async (err: any) => {
	await showToast('error', err?.message ?? Messages.error1, 3500);
};

export const sweetTopSmallSuccessAlert = async (
	msg: string,
	duration: number = 2000,
	enable_forward: boolean = false,
) => {
	showToast('success', msg, duration).then(() => {
		if (enable_forward) {
			window.location.reload();
		}
	});
};

export const sweetErrorAlert = async (msg: string, duration: number = 3000) => {
	await showToast('error', msg, duration);
};
