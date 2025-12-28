import { BrowserRouter, Route, Routes } from 'react-router';
import { createRoot } from 'react-dom/client';
import OwnerApp from './OwnerApp';


const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter>
<Routes>
    <Route path="/dashboard/*" element={<OwnerApp/>}/>
</Routes>
</BrowserRouter>);
window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})