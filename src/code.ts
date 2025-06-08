import { Button } from "./components/button";
import { Checkbox } from "./components/checkbox";
import { List } from "./components/list";
import { postMessageToUI } from "./utils/message";
import type { Mode } from "./types/index";

console.clear();

(function () {
    figma.showUI(__html__, {
			width: 500,
			height: 400,
			themeColors: true
		});
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

const eventMap: Record<string, (arg0: any) => void> = {
  "get-variable-group": getVariableGroup,
  "generate-palettes-on-figma": generatePalettesOnFigma,
};

figma.ui.onmessage = async (msg: { type: string, id?: string, variableIds?: string[], modes?: Mode[], palettes?: any[] }) => {
  if (eventMap[msg.type]) {
    eventMap[msg.type](msg);
    return;
  }
  console.warn(`Unknown message type: ${msg.type}`);
};

async function getVariableGroup(msg: { variableIds?: string[], modes?: Mode[] }): Promise<void> {
  if (!msg.variableIds || !msg.modes || !msg.modes[0]) {
    console.error("Missing variableIds or modes in getVariableGroup");
    return;
  }
  try {
    const variables: (Variable | null)[] = await Promise.all(
      msg.variableIds.map(async (variableId) => figma.variables.getVariableByIdAsync(variableId))
    );

    postMessageToUI({
      name: 'get-collection-variables',
      content: {
        variables: variables.map(variable => ({
          name: variable?.name || 'no name',
          resolvedType: variable?.resolvedType,
          values: variable?.valuesByMode[msg.modes[0].modeId] || '',
        }))
      }
    });
  } catch (error) {
    console.error(error);
  }
}

/**
 *
 * @param msg
 * @returns
 */
function generatePalettesOnFigma(msg: { palettes?: any[] }): void {
  if (!msg.palettes) {
    console.error("No palettes provided to generatePalettesOnFigma");
    return;
  }
  let currentY = 1300;
  const createdRects: SceneNode[] = [];

  msg.palettes.forEach((rootPalette) => {
    if (rootPalette.group) {
      rootPalette.group.forEach((paletteGroup) => {
        addPaletteRow(paletteGroup.palettes);
      });
    }
    if (rootPalette.palettes) {
      addPaletteRow(rootPalette.palettes);
    }
  });

	// Helper to add a row of palettes
	function addPaletteRow(palettes: any[]) {
		currentY += 200;
		palettes.forEach((palette, pIdx) => {
			const color = palette?.value?.r > -1
				? palette.value
				: { r: 1, g: 1, b: 1, a: 1 };
			const colorRect = createColorRect({
				x: 500 + (150 * pIdx),
				y: currentY,
				color
			});
			createdRects.push(colorRect);
		});
	}

  if (createdRects.length > 0) {
    figma.currentPage.selection = createdRects;
    figma.group(createdRects, figma.currentPage);
  }
}

/**
 * Create a color rectangle
 * @param {Object} param0 - The parameters for the color rectangle
 * @param {number} param0.w - The width of the rectangle
 * @param {number} param0.h - The height of the rectangle
 * @param {number} param0.x - The x position of the rectangle
 * @param {number} param0.y - The y position of the rectangle
 * @param {Object} param0.color - The color object
 * @param {number} param0.color.r - The red component of the color (0-1)
 * @param {number} param0.color.g - The green component of the color (0-1)
 * @param {number} param0.color.b - The blue component of the color (0-1)
 * @param {number} param0.color.a - The alpha component of the color (0-1)
 * @returns {RectangleNode} - The created rectangle node
 */
function createColorRect({
  w = 150,
  h = 150,
  x = 0,
  y = 0,
  color: { r, g, b, a }
}: {
  w?: number;
  h?: number;
  x?: number;
  y?: number;
  color: { r: number; g: number; b: number; a: number };
}): RectangleNode {
  const colorRect = figma.createRectangle();
  colorRect.x = x;
  colorRect.y = y;
  colorRect.resize(w, h);
  colorRect.fills = [{ type: 'SOLID', color: { r, g, b }, opacity: a }];
  return colorRect;
}
