import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';

/**
 * Width based rather than user-agent based, so a narrow desktop window gets the mobile tree too.
 * Starts as 'desktop' to match the server render, then settles after mount.
 */
const useDeviceDetect = (): string => {
	const [device, setDevice] = useState<string>('desktop');

	useEffect(() => {
		const media = window.matchMedia(MOBILE_QUERY);
		const updateHandler = () => setDevice(media.matches ? 'mobile' : 'desktop');

		updateHandler();
		media.addEventListener('change', updateHandler);
		return () => media.removeEventListener('change', updateHandler);
	}, []);

	return device;
};

export default useDeviceDetect;
