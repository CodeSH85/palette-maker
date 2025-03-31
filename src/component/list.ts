import { createEle } from "./createEle";
import { postMessageToUI } from "../utils/message";
import { Checkbox } from "./checkbox";

type ListProps = {
	parentElement: string
	items: Item[]
	selectable?: boolean
	subItems?: string
	css?: string
	style?: Record<string, string>
	[key: string]: unknown
}

interface Item {
  name: string;
  id: string;
  [key: string]: unknown;
}

export function List(property: ListProps) {
	const {
		parentElement,
		items,
		selectable = false,
		subItems,
		css,
		style
	} = property

		console.log('list items:', items)
	let children: string | number = "";

	items.forEach(item => {
		const { name, id } = item
		children = children + `
		<li id="${id}">${ selectable ? '' : name }</li>
		`
		// if (selectable) {
		// 	Checkbox({
		// 		parentElement: id,
		// 		label: name,
		// 		checked: false,
		// 	})
		// }
	})

	const attribute: Record<string, unknown> = {};

	attribute.style = {
		...(style || {}),
	};

	const listObj = createEle({
		tag: "ul",
		parentElement,
		attribute,
		children
	})

	postMessageToUI({
		name: "create-element",
		content: listObj
	})
}
