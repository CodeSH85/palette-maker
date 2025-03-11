import { rgbToHex } from "./helper.js";

console.clear();

figma.showUI(__html__);

async function getVariableCollections(): Promise<void> {
  try {
    const variablesCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const processedCollections = variablesCollections.map(collection => ({
      name: collection.name,
      id: collection.id,
      variableIds: collection.variableIds,
    }));
    figma.ui.postMessage({
      type: "get-variable-collections",
      collections: processedCollections
    });
		console.log(rgbToHex({r: 1, g: 2, b: 4, a: 1}));
  } catch (error) {
    console.error(error);
  }
}
getVariableCollections();

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
      figma.ui.postMessage({
        type: 'get-collection-variables',
        variables: variables.map(variable => ({
          name: variable?.name || 'no name',
          values: variable?.valuesByMode[msg.id] || [],
        }))
      });
    } catch (error) {
      console.error(error);
    }
  }
}
