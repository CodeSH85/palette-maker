import { createEle } from "./createEle"
import { postMessageToUI } from "../utils/message"

type ButtonProps = {
	parentElement: string
	label?: string | number
	icon?: string
	variant?: "filled" | "tonal" | "text"
	css?: string
	style?: Record<string, string>
	onClick?: () => void
	[key: string]: unknown
}

export function Button(property: ButtonProps) {
	const {
		label,
		icon,
		parentElement,
		variant = "filled",
		style,
		onClick,
	} = property

	let children: string | number = "";
	if (icon || (label && (typeof label === "string" || typeof label === "number"))) {
		if (icon && label) {
			children = `<i class="${icon}"></i><label>${label.toString()}</label>`
		} else if (icon) {
			children = `<i class="${icon}"></i>`
		} else if (label) {
			children = label.toString()
		}
	}

	// const buttonClass = variant ? `${variant}-button` : "filled-button";
	const buttonStyle = {
		filled: {
			background: 'rgba(49, 87, 44, 1)',
			color: '#FFFFFFFF',
			fontWeight: 500,
			letterSpacing: '1px',
			padding: '10px 16px',
			borderRadius: '8px',
			transition: 'background 0.2s',
			cursor: 'pointer',
			border: 'none'
		},
		tonal: {
			background: 'rgba(49, 87, 44, 1)',
			color: '#FFFFFFFF',
			fontWeight: 500,
			padding: '10px 16px',
			borderRadius: '8px',
			transition: 'background 0.2s',
			cursor: 'pointer'
		},
		text: {
			background: 'transparent',
			color: 'rgba(49, 87, 44, 1)',
			fontWeight: 500,
			padding: '10px 16px',
			borderRadius: '8px',
			transition: 'color 0.2s',
			cursor: 'pointer'
		}
	}

	const attribute: Record<string, unknown> = {};

	if (onClick) {
		attribute.onClick = onClick
	}
	if (variant) {
		attribute.style = buttonStyle[variant]
	}
	if (style) {
		attribute.style = style;
	}

	const buttonObj = createEle({
		tag: "button",
		parentElement,
		attribute,
		children
	})

	postMessageToUI({
		name: "create-element",
		content: buttonObj
	})
}
