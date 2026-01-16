import { createRoot } from 'react-dom/client';
import Overlay from './Overlay.jsx';

const element = document.createElement("div");
element.id = "overlay";
const ROOT = createRoot(element);
ROOT.render(<Overlay/>);

document.body.appendChild(element);