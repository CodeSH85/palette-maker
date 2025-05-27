import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { faCode } from '@fortawesome/free-solid-svg-icons'
import { library, dom } from '@fortawesome/fontawesome-svg-core'
import type { Content, Palettes, FunctionMap } from './types/index'
import type { Variable, RGBA } from '@figma/plugin-typings';

library.add(faBarsStaggered)
library.add(faCode)
dom.watch();

window.onmessage = (event) => {
	const { name, content } = event.data.pluginMessage;
	eventMap[name]?.(content);
};

const eventMap: Record<string, (arg0: Content) => void> = {
	"get-variable-collections": renderVariableCollections,
	"get-collection-variables": getCollectionVariables,
	"create-element": createElement
};

function renderVariableCollections(content: Content): void {
  const { collections } = content as { collections: VariableCollection[] };
	const list = document.querySelector("#variables-collection");
	if (!list) return undefined;

	list!.innerHTML = "";
	collections.forEach(({ name, id, variableIds, modes }) => {
		const li = document.createElement("li");
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

const palettes: Palettes = [];
let currentGroup: {
  parent?: string;
  group?: Array<{ name: string; palettes: Palette[] }>;
  palettes?: Palette[];
} = {};

function getCollectionVariables(content: Content): void {
  const { variables } = content as { variables: Variable[] };

  const colorVariablesDiv = document.querySelector<HTMLDivElement>("#color-variables");
  if (!colorVariablesDiv) return;
  colorVariablesDiv.innerHTML = "";

  const colorVariables = variables.filter((v: Variable) => v.resolvedType === "COLOR");
  const variablesTree = getVariableGroup(colorVariables);

  Object.entries(variablesTree).forEach(([key, value]) =>
    createTree([key, value], '', colorVariablesDiv)
  );
}

/**
 * Get the variable group,
 * e.g. base/green/100 => { base: { green: { 100: { value } } } }
 * @param {Variable[]} collections variable collections
 * @returns Record<string, any>
 */
function getVariableGroup(collections: Variable[]): Record<string, any> {

  const result: Record<string, any> = {};

  collections.forEach((item: Variable) => {
    const parts = item.name.split("/");
    let currentObj: Record<string, any> = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        currentObj[part] = {
          type: 'color',
          value: item.values as RGBA | undefined // Use RGBA for color values
        };
      } else {
        if (!currentObj[part]) {
          currentObj[part] = {};
        }
        currentObj = currentObj[part];
      }
    }
  });
  return result;
}

/**
 * Create a tree structure for the color variables
 * @param {[string, any]} entry
 * @param {string} parent
 * @param {HTMLElement} parentEl
 */
function createTree(entry: [string, unknown], parent: string, parentEl: HTMLElement): void {
  const [key, value] = entry;

  const container = document.createElement("div");
  container.className = 'container flex flex-col w-full';
  container.style.boxSizing = "border-box";
  container.style.paddingLeft = parent ? "12px" : "6px";

  const div = document.createElement("div");
  div.className = "flex w-full";
  div.style.gap = "4px";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = true;

  const label = document.createElement("label");
  label.textContent = key;
  div.append(checkbox);
  div.append(label);
  container.append(div);

  if (parent) {
    if (!currentGroup.group) {
      currentGroup.group = [];
    }
    if (!currentGroup.group.some(g => g.name === parent)) {
      currentGroup.group.push({ name: parent, palettes: [] });
    }
  } else {
    currentGroup.parent = key;
  }

  const subContainer = document.createElement("div");
  subContainer.className = "sub-container flex flex-col w-full";
  subContainer.style.boxSizing = "border-box";
  subContainer.style.paddingLeft = "6px";

  Object.entries(value).forEach(([childKey, childValue]) => {
    if (typeof childValue === 'object' && !childValue.type) {
      // group. e.g. ['base', {100:{}}]
      createTree([childKey, childValue], childKey, container);
    } else {
      // last token. e.g. ['100', {value}]
      const div = document.createElement("div");
      div.className = "flex w-full";
      div.style.cssText = "gap: 4px;border-left: 1px solid #CDCDCD;padding-left:6px;box-sizing: border-box;";
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;

      const paletteObj: Palette = {
        name: childKey,
        value: childValue.value as RGBA
      };

      if (checkbox.checked) {
        if (currentGroup.group?.length) {
          const group = currentGroup.group.find(g => g.name === parent);
          group?.palettes.push(paletteObj);
        } else {
          if (!currentGroup.palettes) currentGroup.palettes = [];
          currentGroup.palettes.push(paletteObj);
        }
      }

      checkbox.onclick = () => {
        // You can implement palette selection logic here if needed
        // e.g. add/remove from palettes array
      };

      const label = document.createElement("label");
      label.textContent = childKey;
      div.append(checkbox, label);
      subContainer.append(div);
    }
  });

  if (subContainer.children.length) {
    container.append(subContainer);
  }
  if (!parent) {
    palettes.push(currentGroup as any); // palettes is Palettes, but currentGroup is a group object; adjust as needed
    currentGroup = {};
  }
  parentEl.append(container);
}

function createElement(content: Content): void {
  const { tag, attribute, children, parentElement } = content as {
    tag: string;
    attribute?: Record<string, string | Record<string, string>> | undefined;
    children?: string | undefined;
    parentElement?: string | undefined;
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

const funcMap: FunctionMap = {
	'generatePalettes': () => {
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
