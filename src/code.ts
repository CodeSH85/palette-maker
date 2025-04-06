import { Button } from "./component/button";
import { Checkbox } from "./component/checkbox";
import { List } from "./component/list";
import { postMessageToUI } from "./utils/message";

console.clear();

(function () {
	figma.showUI(__html__, { width: 500, height: 400 });
	getVariableCollections();
})()

async function getVariableCollections(): Promise<void> {
  try {
    const variablesCollections = await figma.variables.getLocalVariableCollectionsAsync();
		console.log('=======variables', variablesCollections)
    const processedCollections = variablesCollections.map(collection => ({
      name: collection.name,
      id: collection.id,
      variableIds: collection.variableIds,
    }));
		List({
			parentElement: "#variables-collection",
			items: processedCollections,
			selectable: true,
			subItems: 'variableIds'
		});
    postMessageToUI({
      name: "get-variable-collections",
      content: {
				collections: processedCollections
			}
    });
		Button({
			parentElement: "#generate-button",
			label: "Generate",
			variant: 'filled',
			size: 'lg'
		});
		Button({
			parentElement: "#list-button",
			icon: "fa-solid fa-bars-staggered",
			variant: 'filled',
			outlined: true,
			size: 'md'
		});
		Button({
			parentElement: "#code-button",
			icon: "fa-solid fa-code",
			variant: 'filled',
			outlined: true,
			size: 'md'
		});
		Checkbox({
			parentElement: "#variables-item",
			label: "Label"
		});
  } catch (error) {
    console.error(error);
  }
}

figma.ui.onmessage = async (msg: {type: string, id: string, variableIds: string[] }) => {
  if (msg.type === "get-variable-group") {
    console.log(msg.id);
    try {
      const variables = await Promise.all(
        msg.variableIds.map(async (variableId) => {
          return figma.variables.getVariableByIdAsync(variableId);
        })
      );
      console.log(variables);
      postMessageToUI({
        name: 'get-collection-variables',
				content: {
					variables: variables.map(variable => ({
						name: variable?.name || 'no name',
						resolvedType: variable?.resolvedType,
						values: variable?.valuesByMode[msg.id] || [],
					}))
				}
      });
    } catch (error) {
      console.error(error);
    }
  }
}
