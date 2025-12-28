import { useRef, useState } from "react";
import FloorPlan from "./FloorPlan.jsx";
import { useNavigate } from "react-router";
import { setDestination } from "./env.js";
import UserAppClass from "./MainApp.jsx";

function SelectBtn({tableId,onExit}){
    let goToPage = useNavigate();
    let global = UserAppClass.instance.globals;
    return <button onClick={()=>{setDestination(tableId);onExit()}} className="selected-table-button">OK</button>
}

function Selected({table,onExit}){
    if(Object.keys(table).length==0)return "Fuck";


    return <div className="selected-table-info">
        <h2>Τραπέζι {table.id}</h2>
        <p>Χωρητικότητα: {table.capacity} άτομα</p>
        <SelectBtn tableId={table.id} onExit={onExit}/>
    </div>
}



export default function InStoreTableSelector(){
    const selectedRef = useRef("");
    const [selected, selectTable] = useState({element:{},object:{}});
    selectedRef.current = selected;

    function onTableClick(element,object){//Third argument is the pointer event just in case
        element.style.fill = "red";
        element.style.stroke = "red";
        element.style.animation = "pick .5s ease-out";

        selectTable({element,object});

        if(!(selected.element instanceof SVGGraphicsElement))return;
        selected.element.style.fill = selected.element.style.stroke = selected.element.style.animation = "";
    }

    return (
        <div className="table-selector">
            <h1>Επιλογή τραπεζιού</h1><hr/>
            <FloorPlan width="100%" selectTable={onTableClick}/>
            <hr/>
            <Selected table={selected.object} onExit={()=>onTableClick({style:{}})}/>
        </div>
    );
}