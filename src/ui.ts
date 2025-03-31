import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { faCode } from '@fortawesome/free-solid-svg-icons'
// import { far } from '@fortawesome/free-regular-svg-icons'
// import { fab } from '@fortawesome/free-brands-svg-icons'

// library.add(fas, far, fab)
library.add(faBarsStaggered)
library.add(faCode)
dom.watch();

type Content = Record<string, unknown>;

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
          }
        },
        "*"
      );
		};
		list.appendChild(li);
	});
	}
}

function getCollectionVariables(content: Content): void {
  const { variables } = content as { variables: { name: string; valuesByMode: unknown }[] };
  const colorVariablesDiv = document.querySelector("#color-variables");
  if (!colorVariablesDiv) return;
  colorVariablesDiv.innerHTML = "";
  variables.forEach(({ name }) => {
    const div = document.createElement("div");
    div.textContent = `${name}: value`;
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
