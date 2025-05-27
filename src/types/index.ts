export type Content = Record<string, unknown>;

export type Palette = {
	name: string,
	value: RGBA
}
export type Palettes = Palette[];

export type FunctionMap = {
	[eventName: string]: (e?: unknown) => void
}

export type Mode = {
	name: VariableDataType,
	modeId: string
}

export type PostMessage<T> = {
	name: string,
	content?: T
}
