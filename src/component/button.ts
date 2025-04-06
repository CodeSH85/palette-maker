import { createEle } from "./createEle"
import { postMessageToUI } from "../utils/message"

type ButtonProps = {
	parentElement: string
	label?: string | number
	icon?: string
	size?: 'sm' | 'md' | 'lg'
	variant?: "filled" | "tonal" | "text"
	outlined?: boolean
	css?: string
	style?: Record<string, string>
	onClick?: () => void
	[key: string]: unknown
}

export function Button(property: ButtonProps) {
	const {
		label,
		icon,
		size = 'md',
		parentElement,
		variant = "filled",
		outlined,
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
	const buttonSize = {
		sm: '20px',
		md: '28px',
		lg: '36px'
	}
	const buttonStyle = {
		filled: {
			height: buttonSize[size],
			background: '#0C8CE9',
			color: '#FFFFFFFF',
			fontWeight: 500,
			letterSpacing: '1px',
			padding: '0px 16px',
			borderRadius: '8px',
			transition: 'background 0.2s',
			cursor: 'pointer',
			border: 'none'
		},
		tonal: {
			height: buttonSize[size],
			background: '#0C8CE9',
			color: '#FFFFFFFF',
			fontWeight: 500,
			padding: '0px 16px',
			borderRadius: '8px',
			transition: 'background 0.2s',
			cursor: 'pointer'
		},
		text: {
			height: buttonSize[size],
			background: 'transparent',
			color: '#0C8CE9',
			fontWeight: 500,
			padding: '0px 16px',
			borderRadius: '8px',
			transition: 'color 0.2s',
			cursor: 'pointer'
		},
		outlined: {
			height: buttonSize[size],
			background: 'transparent',
			color: '#0C8CE9',
			fontWeight: 500,
			padding: '0px 16px',
			borderRadius: '8px',
			transition: 'color 0.2s',
			cursor: 'pointer',
			border: '1px solid #0C8CE9'
		}
	}

	const attribute: Record<string, unknown> = {};

	if (onClick) {
		attribute.onClick = onClick
	}
	// if (variant) {
	// 	attribute.style = buttonStyle[variant]
	// }
	// if (style) {
	// 	const currentStyle = attribute.style || {}
	// 	attribute.style = {
	// 		...currentStyle,
	// 		style
	// 	};
	// }

	attribute.style = {
		...(outlined? buttonStyle['outlined'] : (buttonStyle[variant] || {})),
		...(style || {}),
		...(icon ? { width: buttonSize[size], padding: '0px' } : {})
	};

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
