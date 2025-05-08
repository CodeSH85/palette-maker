import type { PostMessage } from "../types/index";

/**
 *
 * @param {PostMessage} messageObj
 * @returns
 */
export function postMessageToUI(messageObj: PostMessage): void {
	const { name } = messageObj;
	if (!name || typeof name !== "string") return;
	figma.ui.postMessage(messageObj);
}
