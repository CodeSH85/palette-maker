import { createEle } from "./createEle"
import { postMessageToUI } from "../message"

type ButtonProps = {
	parentElement: string
	label?: string | number
	icon?: string
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
		style,
		onClick,
	} = property

	let children: string | number = "";
	if (label && (typeof label === "string" || typeof label === "number")) {
		if (icon) {
			children = `<span>${icon}<span><label>${label.toString()}<label>`
		} else {
			children = label.toString()
		}
	}

	const attribute: Record<string, unknown> = {};

	if (onClick) {
		attribute.onClick = onClick
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
