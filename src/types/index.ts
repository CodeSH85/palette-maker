export type Content = Record<string, unknown>;

export type Palette = {
	name: string,
	value: RGBA
}
export type Palettes = Palette[];

export type FunctionMap = {
	[eventName: string]: (e?: any) => void
}

export type Mode = {
	name: VariableDataType,
	modeId: string
}

export type PostMessage = {
	name: string,
	content?: unknown
}
