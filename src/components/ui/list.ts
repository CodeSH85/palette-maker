import { createEle } from "./createEle";
import { postMessageToUI } from "../../utils/message";

type ListProps = {
	parentElement: string;
	items: Item[];
	selectable?: boolean;
	style?: Record<string, string>;
}

interface Item {
	name: string;
	id: string;
	[key: string]: unknown;
}

export function List({ parentElement, items, selectable = false, style }: ListProps) {
	let children = "";

	items.forEach(({ name, id }) => {
		children += `<li id="${id}">${selectable ? '' : name}</li>`;
	});

	const attribute: Record<string, unknown> = {
		style: { ...(style || {}) }
	};

	const listObj = createEle({
		tag: "ul",
		parentElement,
		attribute,
		children
	});

	postMessageToUI({
		name: "create-element",
		content: listObj
	});
}
