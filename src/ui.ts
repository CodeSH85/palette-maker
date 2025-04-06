import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { faCode } from '@fortawesome/free-solid-svg-icons'

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
	collections.forEach(({ name, id, variableIds }) => {
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
	console.log(variables);
	const table = getVariableGroup(variables.filter(({ resolvedType }) => resolvedType === "COLOR"));
	console.log(table);
	Object.entries(table).forEach(([key, value]) => {
		const div = document.createElement("div");
		const checkbox = document.createElement("input");
		checkbox.type = "checkbox";
		const label = document.createElement("span");
		label.textContent = key;
		div.append(checkbox);
		div.append(label);

		if (Object.entries(value).length) {
			Object.entries(value).forEach(([val, num]) => {
				const subDiv = document.createElement("div");
				subDiv.style = "padding-left: 1em;"
				const subCheckbox = document.createElement("input");
				subCheckbox.type = "checkbox";

				const subLabel = document.createElement("span");
				subLabel.textContent = `${val}`;
				subDiv.append(subCheckbox);
				subDiv.append(subLabel);
				if (num.length) {
					const numHolder = document.createElement("div");
					numHolder.style = "padding-left: 1em; display: flex; flex-direction: column; width: 100%;";
					num.forEach((item => {
						const numDiv = document.createElement("div");
						numDiv.style = "display: flex; align-items: center; width: 100%;";
						const numCheckbox = document.createElement("input");
						numCheckbox.type = "checkbox";
						numDiv.append(numCheckbox);
						const numLabel = document.createElement("div");
						numLabel.textContent = item;
						numLabel.style = "padding-left: 1em;"
						numDiv.append(numLabel);
						numHolder.append(numDiv);
					}));
					subDiv.append(numHolder);
				}

				div.append(subDiv);
			})
		}
		colorVariablesDiv.appendChild(div);
	});
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

function getVariableGroup(collections: unknown[]): Record<string, Record<string, string>> {
	const table = collections.reduce((obj, item) => {
		const getGroup = item.name.split("/");
		const group = getGroup[0];
		const val = getGroup[1];
		const num = getGroup[getGroup.length - 1];
		if (!obj[group]) obj[group] = {};
		if (!obj[group][val]) {
			obj[group][val] = []
		} else {
			obj[group][val].push(num);
		}
		return obj;
	}, {})
	return table;
}
