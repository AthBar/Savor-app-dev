import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from "react-router";
import UserApp from "./MainApp";
import TestPage from "./TestPage.jsx";

const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter>
<Routes>
    <Route path="/test/*" element={<TestPage/>}/>
    <Route path="/store/*" element={<UserApp/>}/>
</Routes>
</BrowserRouter>);

window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})