import { createEle } from "./createEle";
import { postMessageToUI } from "../../utils/message";

type CheckboxProps = {
	parentElement: string;
	label?: string;
	checked?: boolean;
	style?: Record<string, string>;
	onChange?: () => void;
}

export function Checkbox({ parentElement, label = '', checked = false, style, onChange }: CheckboxProps) {
	const children = `
		<label class="checkbox-container">
			<input
				id="${label}"
				type="checkbox"
				${checked ? 'checked' : ''}
			/>
			<span class="customizedCheckbox"></span>
			<div class="w-full text-left" style="padding-left: 22px">
				<div class="font-medium">${label}</div>
			</div>
		</label>
	`;

	const attribute: Record<string, unknown> = {
		class: 'w-full flex',
		style: { ...(style || {}) }
	};
	if (onChange) attribute.onClick = onChange;

	const checkboxObj = createEle({
		tag: "div",
		parentElement,
		attribute,
		children
	});

	postMessageToUI({
		name: "create-element",
		content: checkboxObj
	});
}
