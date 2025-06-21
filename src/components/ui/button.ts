import { createEle } from "./createEle";
import { postMessageToUI } from "../../utils/message";

type ButtonProps = {
	parentElement: string;
	label?: string | number;
	icon?: string;
	size?: 'sm' | 'md' | 'lg';
	variant?: "filled" | "tonal" | "text";
	outlined?: boolean;
	style?: Record<string, string>;
	events?: Record<string, string>;
	onClick?: () => void;
}

export function Button({
	label,
	icon,
	size = 'md',
	parentElement,
	variant = "filled",
	outlined,
	style,
	events,
	onClick
}: ButtonProps) {
	let children = "";
	if (icon && label) {
		children = `<i class="${icon}"></i><label>${label}</label>`;
	} else if (icon) {
		children = `<i class="${icon}"></i>`;
	} else if (label) {
		children = label.toString();
	}

	const buttonSize = { sm: '20px', md: '28px', lg: '36px' };
	const baseStyle = {
		height: buttonSize[size],
		padding: icon ? '0px' : '0px 16px',
		borderRadius: '8px',
		cursor: 'pointer',
		fontWeight: 500,
		transition: 'background 0.2s, color 0.2s'
	};
	const variantStyle = outlined
		? { ...baseStyle, background: 'transparent', color: 'var(--figma-color-text)', border: 'var(--figma-color-border)' }
		: variant === 'filled'
			? { ...baseStyle, background: 'var(--figma-color-bg-brand)', color: 'var(--figma-color-text)', border: 'none' }
			: variant === 'tonal'
				? { ...baseStyle, background: 'var(--figma-color-bg-brand)', color: 'var(--figma-color-text)' }
				: { ...baseStyle, background: 'transparent', color: 'var(--figma-color-text)' };

	const attribute: Record<string, unknown> = {
		style: { ...variantStyle, ...(style || {}) }
	};
	if (onClick) attribute.onClick = onClick;
	if (events) attribute.events = events;

	const buttonObj = createEle({
		tag: "button",
		parentElement,
		attribute,
		children
	});

	postMessageToUI({
		name: "create-element",
		content: buttonObj
	});
}
