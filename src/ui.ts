import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { faCode } from '@fortawesome/free-solid-svg-icons'
import { rgbToHex } from './utils/helper'

library.add(faBarsStaggered)
library.add(faCode)
dom.watch();

type Content = Record<string, unknown>;

window.onmessage = (event) => {
	const { name, content } = event.data.pluginMessage;
	eventMap[name]?.(content);
};

const eventMap: Record<string, (arg0: Content) => void> = {
	"get-variable-collections": getVariableCollections,
	"get-collection-variables": getCollectionVariables,
	"create-element": createElement
};

function getVariableCollections(content: Content): void {
  const { collections } = content as { collections: { name: string; id: string; variableIds: string[] }[] };
	const list = document.querySelector("#variables-collection");
	if (!list) return undefined;
	list.innerHTML = "";
	collections.forEach(({ name, id, variableIds, modes }) => {
		const li = document.createElement("li");
		// const checkbox = document.createElement("input");
		// checkbox.type = "checkbox";
		// li.append(checkbox);
		const label = document.createElement("span");
		label.textContent = name;
		li.append(label);
		li.setAttribute("id", `collection-${id}`);
		li.onclick = () => {
			parent.postMessage(
				{
					pluginMessage: {
						type: "get-variable-group",
						id,
						variableIds,
						modes
					},
				},
				"*"
			);
		};
		list.appendChild(li);
	});
}

function getCollectionVariables(content: Content): void {
  const { variables } = content as { variables: { name: string; resolvedType: string }[] };
  const colorVariablesDiv = document.querySelector("#color-variables");
  if (!colorVariablesDiv) return;
  colorVariablesDiv.innerHTML = "";
	console.log('variables==',variables);
	const variablesTree = getVariableGroup(variables.filter(({ resolvedType }) => resolvedType === "COLOR"));
	console.log('tree==',variablesTree);
	Object.entries(variablesTree).forEach(([key, value]) => {
		// colorVariablesDiv.appendChild(div);
		createTree([key, value], '', colorVariablesDiv)
	});
}

function createTree(entry, parent, parentEl) {
	const [key, value] = entry;

	const container = document.createElement("div")
	container.className = 'container flex flex-col w-full';
	container.style = "box-sizing: border-box;" + (parent ? "padding-left:12px" : "padding-left:6px;")

	const div = document.createElement("div");
	div.className = "flex w-full"
	div.style = "gap: 4px";
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	const label = document.createElement("label");
	label.textContent = key;
	div.append(checkbox);
	div.append(label);
	container.append(div)

	const subContainer = document.createElement("div");
	subContainer.className = "sub-container flex flex-col w-full"
	subContainer.style = "box-sizing: border-box;padding-left:6px"
	const valueEntry = Object.entries(value);
	valueEntry.forEach(([key, value]) => {
		if (typeof value === 'object' && !value.type) {
			// group. e.g. ['base', {100:{}}]
			createTree([key, value], key, container)
		} else {
			// last token. e.g. ['100', {value}]
			const div = document.createElement("div");
			div.className = "flex w-full"
			div.style = "gap: 4px;border-left: 1px solid #CDCDCD;padding-left:6px;box-sizing: border-box;";
			const checkbox = document.createElement("input");
			checkbox.type = "checkbox";
			const label = document.createElement("label");
			label.textContent = key;
			div.append(checkbox);
			div.append(label);
			subContainer.append(div)
		}
	})
	if (subContainer.children?.length) {
		container.append(subContainer)
	}
	parentEl.append(container)
}

function getVariableGroup(collections: unknown[]): Record<string, Record<string, string>> {
	// const table = collections.reduce((obj, item) => {
	// 	const getGroup = item.name.split("/");
	// 	const group = getGroup[0];
	// 	const val = getGroup[1];
	// 	const num = getGroup[getGroup.length - 1];
	// 	if (!obj[group]) obj[group] = {};
	// 	if (!obj[group][val]) {
	// 		obj[group][val] = []
	// 	} else {
	// 		obj[group][val].push(num);
	// 	}
	// 	return obj;
	// }, {})
	// return table;
	const result = {}
	collections.forEach(item => {
		const parts = item.name.split("/");
		let currentObj = result;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (i === parts.length - 1) {
				currentObj[part] = {
					type: 'color',
					value: (item.values?.r) ? rgbToHex(item.values) : ''
				}
			} else {
				if (!currentObj[part]) {
					currentObj[part] = {}
				}
				currentObj = currentObj[part];
			}
		}
	})
	return result
}

function createElement(content: Content): void {
  const { tag, attribute, children, parentElement } = content as {
    tag: string;
    attribute?: Record<string, string | Record<string, string>>;
    children?: string;
    parentElement?: string;
  };

  const element = document.createElement(tag);
  if (children) {
    element.innerHTML = children;
  }

  if (attribute) {
    for (const [key, value] of Object.entries(attribute)) {
      if (key === "style" && typeof value === "object") {
        for (const [styleKey, styleValue] of Object.entries(value)) {
          element.style[styleKey as any] = styleValue;
        }
      } else if (typeof value === "string") {
        element.setAttribute(key, value);
      }
    }
  }

  const parent = parentElement ? document.querySelector(parentElement) : null;
  parent?.appendChild(element);
}
