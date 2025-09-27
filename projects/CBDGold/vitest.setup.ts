import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock lottie library to avoid canvas usage & unimplemented APIs in jsdom
vi.mock('@evanhahn/lottie-web-light', () => ({
	default: {},
	loadAnimation: () => ({ play: () => { }, stop: () => { }, destroy: () => { } })
}));

// Provide a permissive canvas getContext to silence jsdom not implemented errors
if (typeof HTMLCanvasElement !== 'undefined') {
	// Force override to avoid jsdom throwing Not implemented for getContext
	// @ts-ignore
	HTMLCanvasElement.prototype.getContext = function () {
		return {
			fillStyle: '',
			drawImage: () => { },
			fillRect: () => { },
			getImageData: () => ({ data: [] }),
			putImageData: () => { },
			measureText: () => ({ width: 0 }),
			beginPath: () => { },
			moveTo: () => { },
			lineTo: () => { },
			stroke: () => { },
			arc: () => { },
			closePath: () => { },
			clearRect: () => { },
			save: () => { },
			restore: () => { },
			translate: () => { },
			scale: () => { },
			fill: () => { },
		} as any;
	};
}
