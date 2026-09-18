export interface AddressUpdate {
	_id: string;
	recipientName?: string;
	recipientPhone?: string;
	addressLine1?: string;
	addressLine2?: string;
	city?: string;
	postalCode?: string;
	isDefault?: boolean;
}
