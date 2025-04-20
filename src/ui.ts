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

type Palettes = object[];
let palettes: Palettes = [];
let currentGroup = {} as { parent?: string; group?: object[]; palettes?: object[]}
function getCollectionVariables(content: Content): void {
  const { variables } = content as { variables: { name: string; resolvedType: string }[] };
  const colorVariablesDiv = document.querySelector("#color-variables");
  if (!colorVariablesDiv) return;
  colorVariablesDiv.innerHTML = "";
	console.log('variables==',variables);
	const variablesTree = getVariableGroup(variables.filter(({ resolvedType }) => resolvedType === "COLOR"));
	console.log('tree==',variablesTree);
	Object.entries(variablesTree).forEach(([key, value]) => {
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
	checkbox.checked = true;
	const label = document.createElement("label");
	label.textContent = key;
	div.append(checkbox);
	div.append(label);
	container.append(div)

	if (parent) {
		if (!currentGroup.group) {
			currentGroup['group'] = []
		}
		currentGroup.group.push({
			name: parent,
			palettes: []
		})
	} else {
		currentGroup['parent'] = key
	}

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
			checkbox.checked = true;
			if (checkbox.checked === true) {
				if (currentGroup.group?.length) {
					currentGroup.group.find(g => g.name === parent)?.palettes.push({
						name: key,
						value: value.value
					})
				} else {
					if (!currentGroup.palettes) {
						currentGroup.palettes = []
					}
					currentGroup.palettes.push({
						name: key,
						value: value.value
					})
				}
			}
			checkbox.onclick = () => {
				const color = {
					name: key,
					value: value.value
				}
				console.log(checkbox.checked, color)
				if (checkbox.checked === true) {
					palettes.push(color)
				} else if (palettes.map(p => p)) {

				}
			}
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
	if (!parent) {
		palettes.push(currentGroup)
		currentGroup = {}
	}
	parentEl.append(container)
}

function getVariableGroup(collections: unknown[]): Record<string, Record<string, string>> {
	const result = {}
	collections.forEach(item => {
		const parts = item.name.split("/");
		let currentObj = result;

		for (let i = 0; i < parts.length; i++) {
			const part = parts[i];
			if (i === parts.length - 1) {
				currentObj[part] = {
					type: 'color',
					// value: (item.values?.r) ? rgbToHex(item.values) : ''
					value: item.values
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
      } else if (key === 'events') {
				for (const [event, handler] of Object.entries(value)) {
					element.addEventListener(event, funcMap[handler as keyof typeof funcMap]);
				}
			} else if (typeof value === "string") {
        element.setAttribute(key, value);
      }
    }
  }

  const parent = parentElement ? document.querySelector(parentElement) : null;
  parent?.appendChild(element);
}

type FunctionMap = {
	[eventName: string]: (e?: any) => void
}
const funcMap: FunctionMap = {
	'generatePalettes': () => {
		console.log(palettes)
		parent.postMessage(
			{
				pluginMessage: {
					type: "generate-palettes-on-figma",
					palettes,
				},
			},
			"*"
		);
	}
}
