import { createRoot } from 'react-dom/client';
import { BrowserRouter } from "react-router";
import UserApp from './user/MainApp';

const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter><UserApp/></BrowserRouter>);

window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})