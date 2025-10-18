import '@testing-library/jest-dom';
import { vi } from 'vitest';

(globalThis as { __TESTING__?: boolean }).__TESTING__ = true;

// Mock lottie library to avoid canvas usage & unimplemented APIs in jsdom
vi.mock('@evanhahn/lottie-web-light', () => ({
	default: {},
	loadAnimation: () => ({ play: () => { }, stop: () => { }, destroy: () => { } })
}));

// Provide a permissive canvas getContext to silence jsdom not implemented errors
if (typeof HTMLCanvasElement !== 'undefined') {
	const prototypeWithOverride = HTMLCanvasElement.prototype as unknown as {
		getContext: () => unknown;
	};
	prototypeWithOverride.getContext = function () {
		const stub: Record<string, unknown> = {
			fillStyle: '',
			drawImage: () => undefined,
			fillRect: () => undefined,
			getImageData: () => ({ data: [] as unknown[] }),
			putImageData: () => undefined,
			measureText: () => ({ width: 0 }),
			beginPath: () => undefined,
			moveTo: () => undefined,
			lineTo: () => undefined,
			stroke: () => undefined,
			arc: () => undefined,
			closePath: () => undefined,
			clearRect: () => undefined,
			save: () => undefined,
			restore: () => undefined,
			translate: () => undefined,
			scale: () => undefined,
			fill: () => undefined,
		};
		return stub;
	};
}
