import React, { ReactNode, useEffect, useRef, useState } from 'react';

interface RevealType {
	children: ReactNode;
	className?: string;
}

/** fades its section up the first time it scrolls into view; the CSS does the motion */
const Reveal = (props: RevealType) => {
	const { children, className = '' } = props;
	const ref = useRef<HTMLDivElement>(null);
	const [shown, setShown] = useState<boolean>(false);

	/** LIFECYCLES **/
	useEffect(() => {
		const node = ref.current;
		if (!node) return;
		if (typeof IntersectionObserver === 'undefined') {
			setShown(true);
			return;
		}
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return;
				setShown(true);
				observer.disconnect();
			},
			{ threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
		);
		observer.observe(node);
		return () => observer.disconnect();
	}, []);

	return (
		<div ref={ref} className={`reveal ${shown ? 'in-view' : ''} ${className}`}>
			{children}
		</div>
	);
};

export default Reveal;
