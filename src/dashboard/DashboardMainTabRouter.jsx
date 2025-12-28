import { Route, Routes } from "react-router";
import DashboardBasicsTab from "./DashboardBasicsTab";
import DashboardMenuTab from "./DashboardMenuTab";
import DashboardMenuDishesTab from "./DashboardMenuDishesTab";
import DashboardMenuDesignTab from "./DashboardMenuDesignTab";
import DashboardMenuAssignTab from "./DashboardMenuAssignTab";
import DashboardQrTab from "./DashboardQrTab";

function MenuRouter(){
    return <Routes>
        <Route path="" element={<DashboardMenuTab/>}/>
        <Route path="dishes" element={<DashboardMenuDishesTab/>}/>
        <Route path="design" element={<DashboardMenuDesignTab/>}/>
        <Route path="assign" element={<DashboardMenuAssignTab/>}/>
        <Route path="*" element={<NotReady/>}/>
    </Routes>
}
function NotReady(){
    return <div><h1>Αυτή η σελίδα δεν είναι ακόμη διαθέσιμη</h1></div>;
}
export default function DashboardMainTabRouter(){
    return <Routes>
        <Route path="" element={<DashboardBasicsTab/>}/>
        <Route path="menu/*" element={<MenuRouter/>}/>
        <Route path="qr" element={<DashboardQrTab/>}/>
        <Route path="*" element={<NotReady/>}/>
    </Routes>;
}