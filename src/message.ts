type PostMessage = {
	name: string,
	content?: unknown
}

/**
 *
 * @param {PostMessage} messageObj
 * @returns
 */
export function postMessageToUI(messageObj: PostMessage): void {
	const { name } = messageObj;
	console.log(messageObj);
	if (!name || typeof name !== "string") return;
	figma.ui.postMessage(messageObj);
}
