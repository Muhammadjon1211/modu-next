/** the standard admin-table recipe — every admin list sorts its current page with these */

export type Order = 'asc' | 'desc';

export interface HeadCell<D> {
	id: keyof D;
	label: string;
	numeric: boolean;
	sortable?: boolean;
}

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
	if (b[orderBy] < a[orderBy]) return -1;
	if (b[orderBy] > a[orderBy]) return 1;
	return 0;
}

export function getComparator<D>(order: Order, orderBy: keyof D): (a: D, b: D) => number {
	return order === 'desc'
		? (a, b) => descendingComparator(a, b, orderBy)
		: (a, b) => -descendingComparator(a, b, orderBy);
}
