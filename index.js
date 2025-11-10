(function () {

	// 初始化 cycle 圆动画：计算圆周并触发 CSS 动画（逆时针，从顶端开始）
	function initCycleAnimation() {
		const circle = document.querySelector('.cycle-circle');
		if (!circle) return;

		// r 在 viewBox 单位下
		const r = circle.r.baseVal.value;
		const circumference = 2 * Math.PI * r;

		// 将 dasharray 设置为周长；为了实现逆时针效果，我们从 -circumference 到 0
		circle.style.strokeDasharray = String(circumference);
		// 设置一个 CSS 变量供关键帧使用（起始为负值）
		circle.style.setProperty('--dashstart', String(-circumference));
		// 立刻设置初始偏移（负值）以避免在渲染前可见
		circle.style.strokeDashoffset = String(-circumference);

		// 强制重绘后添加动画类以触发动画
		requestAnimationFrame(() => {
			circle.classList.add('animate');
			setTimeout(() => {
				const mask = document.querySelector('.process-bar-mask');
				if (mask) {
					// 在 mask 动画结束后再等 300ms 启动 process-bar 动画
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

	// 初始执行
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', () => {
			initCycleAnimation();
		});
	} else {
		initCycleAnimation();
	}

	/* ---------------- process-bar animation & value display ---------------- */
	function startProcessBarAnimation() {
		const container = document.getElementById('cycle');
		const bar = document.querySelector('.process-bar');
		const number = document.querySelector('.process-value');
		if (!container || !bar || !number) return;

		// 创建或获取显示数值的元素
		let display = document.querySelector('.process-value');
		if (!display) {
			display = document.createElement('div');
			display.className = 'process-value';
			container.appendChild(display);
		}

		const processValue = [0, 0.04, 0.12, 0.15, 0.24, 0.33, 0.34, 0.35, 0.35];
		const today = Date.now();
		const startDay = new Date(2023, 5, 22);
		const TARGET_FRACTION = processValue[Math.floor((today - startDay) / (1000 * 60 * 60 * 24)) % processValue.length];
		const targetPx = Math.round(container.clientHeight * TARGET_FRACTION);
		const DURATION = 1000; // 动画时长（ms），可调整或变为变量

		// 动画：从 0 -> targetPx，用 requestAnimationFrame 精确更新并显示数值
		bar.style.height = '0px';
		let start = null;
		function step(ts) {
			if (!start) start = ts;
			const elapsed = ts - start;
			const t = Math.min(1, elapsed / DURATION);
			const ease = 1 - Math.pow(1 - t, 3);;
			const current = Math.round(targetPx * ease);
			bar.style.height = current + 'px';
			const percent = Math.round((current / container.clientHeight) * 100);
			display.textContent = percent + '%';
			display.style.top = (container.clientHeight - current) + 'px';
			if (t < 1) requestAnimationFrame(step);
			else {
				// 确保最终值精确到目标
				bar.style.height = targetPx + 'px';
				display.textContent = Math.round(TARGET_FRACTION * 100) + '%';
			}
		}
		number.style.opacity = '1';
		requestAnimationFrame(step);
	}
})();
