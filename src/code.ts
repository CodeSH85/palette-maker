import { Button } from "./components/button";
import { Checkbox } from "./components/checkbox";
import { List } from "./components/list";
import { postMessageToUI } from "./utils/message";
import type { Mode } from "./types/index";

console.clear();

(function () {
	figma.showUI(__html__, { width: 500, height: 400 });
	getVariableCollections();
})();

async function getVariableCollections(): Promise<void> {
  try {
    const variablesCollections = await figma.variables.getLocalVariableCollectionsAsync();
    const processedCollections = variablesCollections.map(collection => ({
      name: collection.name,
      id: collection.id,
      variableIds: collection.variableIds,
      modes: collection.modes
    }));
    List({
      parentElement: "#variables-collection",
      items: processedCollections,
      selectable: true
    });
    postMessageToUI({
      name: "get-variable-collections",
      content: { collections: processedCollections }
    });
    Button({
      parentElement: "#generate-button",
      label: "Generate",
      variant: 'filled',
      size: 'lg',
      events: { 'click': 'generatePalettes' }
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

figma.ui.onmessage = async (msg: {type: string, id?: string, variableIds?: string[], modes?: Mode[], palettes?: object[] }) => {
  if (msg.type === "get-variable-group") {
    try {
      const variables = await Promise.all(
        msg.variableIds.map(async (variableId) => figma.variables.getVariableByIdAsync(variableId))
      );
      postMessageToUI({
        name: 'get-collection-variables',
        content: {
          variables: variables.map(variable => ({
            name: variable?.name || 'no name',
            resolvedType: variable?.resolvedType,
            values: variable?.valuesByMode[msg.modes[0].modeId] || [],
          }))
        }
      });
    } catch (error) {
      console.error(error);
    }
  } else if (msg.type === 'generate-palettes-on-figma') {
    let currentY = 1300;
    msg.palettes.forEach((rootPalette) => {
      if (rootPalette.group) {
        rootPalette.group.forEach((paletteGroup) => {
          currentY += 200;
          paletteGroup.palettes.forEach((palette, pIdx) => {
            const colorRect = figma.createRectangle();
            colorRect.x = 500 + (150 * pIdx);
            colorRect.y = currentY;
            colorRect.resize(150, 150);
            if (palette?.value?.r > -1) {
              const { r, g, b, a } = palette.value;
              colorRect.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
            } else {
              colorRect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
            }
            figma.currentPage.selection = figma.currentPage.selection.concat(colorRect);
          });
        });
      }
      if (rootPalette.palettes) {
        currentY += 200;
        rootPalette.palettes.forEach((palette, pIdx) => {
          const colorRect = figma.createRectangle();
          colorRect.x = 500 + (150 * pIdx);
          colorRect.y = currentY;
          colorRect.resize(150, 150);
          if (palette?.value?.r > -1) {
            const { r, g, b, a } = palette.value;
            colorRect.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
          } else {
            colorRect.fills = [{ type: 'SOLID', color: { r: 1, g: 1, b: 1 }, opacity: 1 }];
          }
          figma.currentPage.selection = figma.currentPage.selection.concat(colorRect);
        });
      }
    });
    figma.group(figma.currentPage.selection, figma.currentPage);
  }
};

