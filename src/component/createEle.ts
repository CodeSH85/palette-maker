type ElementProp = {
	tag: string;
	attribute?: Record<string, unknown>;
	children?: string | unknown[];
	parentElement?: string
};

const validHTMLTags = new Set([
	"a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "blockquote",
	"body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist",
	"dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption",
	"figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr",
	"html", "i", "iframe", "img", "input", "ins", "kbd", "label", "legend", "li", "link", "main", "map",
	"mark", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p",
	"param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section",
	"select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody",
	"td", "template", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul",
	"var", "video", "wbr"
]);


function isValidHTMLElement(tag: string): boolean {
	return !(typeof tag !== "string" || !validHTMLTags.has(tag));
}

export function createEle(property: ElementProp): ElementProp {
	if (
		!property ||
		typeof property !== "object" ||
		typeof property.tag !== "string"
	) {
		throw new Error("Invalid element properties");
	}

	const tag = property.tag.toLowerCase();
	if (!isValidHTMLElement(tag)) {
		throw new Error(`Invalid HTML element tag: ${tag}`);
	}
	console.log({ ...property, tag });
	return { ...property, tag };
}
