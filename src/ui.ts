import { library, dom } from '@fortawesome/fontawesome-svg-core'
import { faBarsStaggered } from '@fortawesome/free-solid-svg-icons'
import { faCode } from '@fortawesome/free-solid-svg-icons'

library.add(faBarsStaggered)
library.add(faCode)
dom.watch();

window.onmessage = (event) => {
	const { name, content } = event.data.pluginMessage;
	console.log('content:', content);
	eventMap[name]?.(content);
};
