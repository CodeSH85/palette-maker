import { createEle } from "./createEle";
import { postMessageToUI } from "../utils/message";

type CheckboxProps = {
	parentElement: string
	label?: string
	css?: string
	style?: Record<string, string>
	checked?: boolean
	onChange?: () => void
	[key: string]: unknown
}

export function Checkbox(property: CheckboxProps) {
	const {
		parentElement,
		label,
		css,
		style,
		checked = false,
		onChange
	} = property

	let children: string | number = "";

	children = `
		<label class="container">
			<div class="w-full text-left"
				style="padding-left: 22px"
			>
				<div for="${ label ?? '' }" class="font-medium">${ label ?? '' }</div>
			</div>
			<input
				id="${label}"
				type="checkbox"
				checked="${checked}"
			/>
			<span class="customizedCheckbox"></span>
		</label>
	`
	const attribute: Record<string, unknown> = {};
	if (onChange) {
		attribute.onClick = onChange
	}
	attribute.class = 'w-full flex'
	attribute.style = {
		...(style || {}),
	};

	const checkboxObj = createEle({
		tag: "div",
		parentElement,
		attribute,
		children
	})

	postMessageToUI({
		name: "create-element",
		content: checkboxObj
	})
}
