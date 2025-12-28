import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from 'react-dom/client';
import CollisionSimulator from "./krouseis.jsx";
import Pedio from "./pedio.jsx";
import AuthPage from "./auth/main.jsx";
import Homepage from "./Homepage.jsx";
import TestPage from "./user/TestPage.jsx";

//Jsq_di3ie4-Wp4FRavYz66k1JyBQqJywyQGH
//HHMqH36B8VLiJOXpQlbAFmAnPY1seghodajF
export const PLACE_ID = "Jsq_di3ie4-Wp4FRavYz66k1JyBQqJywyQGH";

function App() {
    return <Routes>
        <Route path="/" element={<Homepage/>}/>
        <Route path="/auth/*" element={<AuthPage/>}/>
        <Route path="/krouseis" element={<CollisionSimulator/>}/>
        <Route path="/pedio" element={<Pedio/>}/>
        <Route path="/not-open" element="Place is closed"/>
        <Route path="/test/*" element={<TestPage/>}/>
        <Route path="*" element="404"/>
    </Routes>
}
const ROOT = createRoot(document.querySelector("#root"));
ROOT.render(<BrowserRouter><App/></BrowserRouter>);