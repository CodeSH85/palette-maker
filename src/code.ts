import { Button } from "./component/button";
import { postMessageToUI } from "./utils/message";

console.clear();

(function () {
	figma.showUI(__html__, { width: 300, height: 500 });
	getVariableCollections();
})()

async function getVariableCollections(): Promise<void> {
  try {
    const variablesCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const processedCollections = variablesCollections.map(collection => ({
      name: collection.name,
      id: collection.id,
      variableIds: collection.variableIds,
    }));
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
		});
		Button({
			parentElement: "#list-button",
			icon: "fa-solid fa-bars-staggered",
			variant: 'filled',
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
						values: variable?.valuesByMode[msg.id] || [],
					}))
				}
      });
    } catch (error) {
      console.error(error);
    }
  }
}
