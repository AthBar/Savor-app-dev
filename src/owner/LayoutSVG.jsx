import { createContext, useContext, useEffect, useSyncExternalStore } from "react";
import LayoutManager from "./LayoutManager.js";
import { useListenerApp } from "./ListenerAppBase.jsx";
export const TABLE_REGEX = /^[A-Za-z0-9_-]{4}$/g; //I need to organize ts

/**
 * This shit converts layout objects to SVGs using react. Yes it does
 */
function Area({rect,tag}){
    let d = [...rect,
        rect[0]+rect[2]/2,
        rect[1]+rect[3]/2
    ]
    let text = <text 
            x={d[4]}
            y={d[5]}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="18"
            fill="gray"
        >
            {tag}
        </text>;
    return <g>
        <rect
            x={d[0]}
            y={d[1]}
            width={d[2]}
            height={d[3]}
            className={"layout-area " + tag}
        />
        {["Kitchen","WC"].includes(tag)?text:null}
    </g>
}

function Table({tag,id,position,size,blink:_blink={from:"gray",to:"gray"}}){
    const app = useListenerApp();
    const manager = app.layoutManager;
    const blink = manager.blinks[id];
    const selected = app.selectedTable==id;

    useSyncExternalStore(app.subscription,()=>app.selectedTable==id);
    useSyncExternalStore(manager.subscription,()=>manager.blinks[id]);

    return <g onMouseDown={e=>{
            app.selectTable(id);
            e.stopPropagation();
        }}>
        <rect 
            x={position[0]-size[0]/2} 
            y={position[1]-size[1]/2} 
            width={size[0]} 
            height={size[1]} 
            className={tag+(selected?" blink selected":" blink")} 
            id={id}
            style={{
                "--default-color":blink?.from||"gray",
                "--blink-color":blink?.to||"gray"
            }}
        />
        <text 
            x={position[0]} 
            y={position[1]} 
            textAnchor="middle" 
            dominantBaseline="middle" 
            fontSize="18"
        > 
            {id}
        </text>
    </g>;
}

const LayoutManagerContext = createContext();
/**
 * 
 * @returns {LayoutManager}
 */
export const useLayoutManager = ()=>useContext(LayoutManagerContext);

export function LayoutVisualizer({app}){
    const manager = app.layoutManager;

    useEffect(()=>{
        manager.initialize()
    },[manager]);

    useSyncExternalStore(manager.subscription,()=>manager.isLoaded);
    useSyncExternalStore(app.subscription,()=>app.selectedTable);

    if(!manager.isLoaded)
        return <div style={
            {
                height:"100%",
                textAlign:"center",
                display:"flex",
                flexDirection:"column",
                placeContent:"center",
                fontSize:"3em"
            }}>Εμφάνιση κάτοψης...</div>;

    const {areas,tables} = manager.layout;

    const areaRects = areas.map((area,index)=>
        <Area 
            rect={area.rect}
            tag={area.tag}
            key={index}
        />
    );

    const tableRects = Object.values(tables).map(table=>{
        return <Table 
            key={table.id}
            id={table.id}
            position={table.position}
            size={[95,80]}
            tag={table.tag}
        />
    })
    
    return <LayoutManagerContext.Provider value={manager}>
    <svg 
        viewBox="-650 -310 1185 530"
        style={{width:"100%",height:"100%"}}
        xmlns="http://www.w3.org/2000/svg"
        onMouseDown={()=>app.selectTable(null)}
        > 
            {manager.layout?
                [...areaRects,...tableRects]:
                <text x="-238" y="-90" style={{fontSize:"3em",dominantBaseline:"middle",textAlign:"center"}}>Δεν υπάρχει κάτοψη</text>
            }
        </svg>
        </LayoutManagerContext.Provider>
}