export type Content = Record<string, unknown>;

export type Palettes = object[];

export type FunctionMap = {
	[eventName: string]: (e?: any) => void
}

export interface Mode {
	name: string,
	modeId: string
}

export type PostMessage = {
	name: string,
	content?: unknown
}
