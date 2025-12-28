import { BrowserRouter, Routes, Route, useParams } from "react-router";
import { createRoot } from 'react-dom/client';
import MainApp from "./MainApp";

//Jsq_di3ie4-Wp4FRavYz66k1JyBQqJywyQGH
//HHMqH36B8VLiJOXpQlbAFmAnPY1seghodajF
export const PLACE_ID = "Jsq_di3ie4-Wp4FRavYz66k1JyBQqJywyQGH";

function AppWithParams(props){
    const params = useParams();
    return <MainApp {...props} placeId={params.placeId}/>
}

function PlaceApp() {
    return <Routes>
        <Route path="/place/:placeId/*" element={<AppWithParams/>}/>
        <Route path="*" element="404"/>
    </Routes>
}
const ROOT = createRoot(document.querySelector("#root"));
ROOT.render(<BrowserRouter><PlaceApp/></BrowserRouter>);

window.addEventListener("DOMContentLoaded",()=>{
    if(window.loadingElement)window.loadingElement.style.display = "none";
})