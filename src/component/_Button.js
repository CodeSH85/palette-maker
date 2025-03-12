/**
 *
 * @param {string} param.label
 * @param {string} param.icon
 * @param {string} param.css
 * @param {object} param.style
 * @param {} param.onClick
 * @returns
 */
export function Button({ label, icon, css, style, onClick }) {
	const button = document.createElement("button");
	button.innerText = label;
	button.innerHTML = (label && icon)
		? `<span>${icon}</span><label>${label}</label>`
		: label || icon || ''

	if (css) {
		button.classList.add(...css.split(" "));
	}

	Object.assign(button.style, {
		display: "flex",
		alignItems: "center",
		gap: "6px",
		...(style || {})
	})

	if (onClick) {
		button.addEventListener("click", onClick);
	}

	return button;
}

// if (typeof module !== "undefined") {
// 	module.exports = Button;
// }
