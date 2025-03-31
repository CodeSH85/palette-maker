import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { faCode } from '@fortawesome/free-solid-svg-icons'
// import { far } from '@fortawesome/free-regular-svg-icons'
// import { fab } from '@fortawesome/free-brands-svg-icons'

// library.add(fas, far, fab)
library.add(faBarsStaggered)
library.add(faCode)
dom.watch();

window.onmessage = (event) => {
	const { name, content } = event.data.pluginMessage;
	console.log('content:', content);
	if (name === "get-variable-collections") {
		const { collections } = content;
		const list = document.querySelector("#variables-collection");
		list.innerHTML = "";
		collections.forEach(({ name, id, variableIds }) => {
			const li = document.createElement("li");
			li.textContent = name;
			li.setAttribute("id", `collection-${id}`);
			li.onclick = () => {
				parent.postMessage(
					{
						pluginMessage: {
							type: "get-variable-group",
							id,
							variableIds
						},
					},
					"*"
				);
			};
			list.appendChild(li);
		});
	} else if (name === 'get-collection-variables') {
		const { variables } = content;
		const colorVariablesDiv = document.querySelector("#color-variables");
		colorVariablesDiv.innerHTML = "";
		variables.forEach(({ name, valuesByMode }) => {
			const div = document.createElement("div");
			div.textContent = `${name}: value`;
			colorVariablesDiv.appendChild(div);
		});
	}
	if (name === "create-element") {
		const { tag, attribute, children, parentElement } = content;

		const element = document.createElement(tag);

		if (children) {
			element.innerHTML = children;
		}

		if (!!(attribute && Object.keys(attribute).length)) {
			for (const [key, value] of Object.entries(attribute)) {
				if (key === "style") {
					for (const [styleKey, styleValue] of Object.entries(value)) {
						element.style[styleKey] = styleValue;
					}
				} else if (typeof value === "string") {
					element.setAttribute(key, value);
				}
			}
		}

		// Mount to parent element
		let parent;
		if (parentElement) {
			parent = document.querySelector(parentElement);
		}
		parent.appendChild(element);
	}
};
