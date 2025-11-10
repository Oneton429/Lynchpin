(function () {
	const processValue = [0, 0.04, 0.12, 0.15, 0.24, 0.33, 0.34, 0.35, 0.35];
	let TARGET_FRACTION = 0.35;
	window.wallpaperPropertyListener = {
		applyUserProperties: function (properties) {
			if (properties.show_access_pulse) {
				const access = document.querySelector('.access-animation');
				if (access && properties.show_access_pulse.value) {
					access.style.display = 'block';
					access.classList.add('animate');
				} else if (access) {
					access.style.display = 'none';
					access.classList.remove('animate');
				}
			}
			if (properties.process_value) {
				const number = document.querySelector('.process-value');
				TARGET_FRACTION = properties.process_value.value / 100;
				if (number && number.style.opacity === '1')
					startProcessBarAnimation();
			}
			if (properties.auto_process_value) {
				const number = document.querySelector('.process-value');
				if (properties.auto_process_value.value) {
					const today = Date.now();
					const startDay = new Date(2023, 5, 22);
					TARGET_FRACTION = processValue[Math.floor((today - startDay) / (1000 * 60 * 60 * 24)) % processValue.length];
					if (number && number.style.opacity === '1')
						startProcessBarAnimation();
				} else {
					TARGET_FRACTION = properties.process_value ? properties.process_value.value / 100 : 0.35;
					if (number && number.style.opacity === '1')
						startProcessBarAnimation();
				}
			}
			if (properties.noise_volume) {
				const audio = document.querySelector('audio');
				if (audio) {
					audio.volume = properties.noise_volume.value / 100;
				}
			}
			if (properties.noise_play) {
				const audio = document.querySelector('audio');
				if (audio) {
					if (properties.noise_play.value) {
						audio.play();
					} else {
						audio.pause();
					}
				}
			}
		},
	};

	function initCycleAnimation() {
		const circle = document.querySelector('.cycle-circle');
		if (!circle) {
			return;
		}

		const r = circle.r.baseVal.value;
		const circumference = 2 * Math.PI * r;

		circle.style.strokeDasharray = String(circumference);
		circle.style.setProperty('--dashstart', String(-circumference));
		circle.style.strokeDashoffset = String(-circumference);

		requestAnimationFrame(() => {
			circle.classList.add('animate');
			setTimeout(() => {
				const mask = document.querySelector('.process-bar-mask');
				if (mask) {
					const onMaskEnd = () => {
						mask.removeEventListener('animationend', onMaskEnd);
						startProcessBarAnimation();
					};
					mask.addEventListener('animationend', onMaskEnd);
					mask.classList.add('fade');
				}
			}, 2000);
		});
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			initCycleAnimation();
		});
	} else {
		initCycleAnimation();
	}

	function startProcessBarAnimation() {
		const container = document.getElementById('cycle');
		const bar = document.querySelector('.process-bar');
		if (!container || !bar) return;

		let display = document.querySelector('.process-value');
		if (!display) {
			display = document.createElement('div');
			display.className = 'process-value';
			container.appendChild(display);
		}

		const barTargetHeight = TARGET_FRACTION * 100;
		const DURATION = 1000;

		let start = null;
		const barStartHeight = bar.style.height ? parseInt(bar.style.height) : 0;
		const displayStartTop = display.style.top ? parseInt(display.style.top) : 100;
		let displayTargetTop;
		const diamondDangerArea = 4.75 * Math.SQRT2 / 2 * (container.clientWidth / container.clientHeight) / 100;
		const displayDangerArea = 2.5 * (container.clientWidth / container.clientHeight) / 100;
		if (0.5 - diamondDangerArea - displayDangerArea < TARGET_FRACTION && TARGET_FRACTION < 0.5 + diamondDangerArea) {
			displayTargetTop = (0.5 - diamondDangerArea) * 100;
		} else if (TARGET_FRACTION >= 0.95) {
			displayTargetTop = 5;
		} else {
			displayTargetTop = (1 - TARGET_FRACTION) * 100;
		}

		function step(ts) {
			if (!start) {
				start = ts;
			}
			const elapsed = ts - start;
			const t = Math.min(1, elapsed / DURATION);
			const ease = 1 - Math.pow(1 - t, 3);;
			const current = barStartHeight + (barTargetHeight - barStartHeight) * ease;
			bar.style.height = current + '%';
			display.textContent = Math.round(current) + '%';
			display.style.top = (displayStartTop + (displayTargetTop - displayStartTop) * ease) + '%';

			if (t < 1) {
				requestAnimationFrame(step);
			} else {
				bar.style.height = barTargetHeight + '%';
				display.textContent = Math.round(TARGET_FRACTION * 100) + '%';
			}
		}
		display.style.opacity = '1';
		requestAnimationFrame(step);
	}
})();