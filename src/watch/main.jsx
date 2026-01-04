import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes, useParams } from "react-router";
import OwnerApp3 from '../owner/App3.jsx';
import PlaceSelection from '../dashboard/PlaceSelection.jsx';
import PlaceSelector from './PlaceSelector.jsx';

function _OwnerApp3(){
    const {placeId} = useParams();
    return <OwnerApp3 placeId={placeId}/>
}

const ROOT = createRoot(document.querySelector("div#root"));
ROOT.render(<BrowserRouter>
<Routes>
    <Route path="/watch/select" element={<PlaceSelector/>}/>
    <Route path="/watch/:placeId/" element={<_OwnerApp3/>}/>
    <Route path="*" element="404"/>
</Routes>
</BrowserRouter>);

window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})