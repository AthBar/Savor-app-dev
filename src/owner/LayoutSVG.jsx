import { createRef } from "react";
import { EventComponent } from "../common/Event";
import { API } from "../common/functions";
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

class Table extends EventComponent{
    #id;#onclick;#selected;#ref=createRef();#rectRef=createRef();
    constructor(props){
        const {position,size,tag,id,blink,onclick,selected} = props;
        super(props);

        this.#id = id;
        this.#onclick=onclick;
        this.state = {
            position,
            size,
            tag,
            blink,
            selected
        };
        if(selected)console.log("selected",id)
        this.#selected = selected;
    }
    get id(){return this.#id}
    set blink(v){
        this.setState({blink:v})
    }
    get selected(){
        return this.#selected;
    }
    set selected(v){
        this.#selected = v;
        this.setState({selected:v});
    }
    render(){
        const {position,size,tag,blink,selected} = this.state;
        return <g onClick={this.#onclick} ref={this.#ref}>
            <rect 
                x={position[0]-size[0]/2} 
                y={position[1]-size[1]/2} 
                width={size[0]} 
                height={size[1]} 
                className={tag+(selected?" blink selected":" blink")} 
                id={this.#id}
                style={{
                    "--default-color":blink.from,
                    "--blink-color":blink.to
                }}
                ref={this.#rectRef}
            />
            <text 
                x={position[0]} 
                y={position[1]} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                fontSize="18"
            >
                {this.#id}
            </text>
        </g>;
    }
}

export default class LayoutSVG extends EventComponent{
    /**
     * @type {LayoutSVG}
     */
    static instance;
    #rects = {areas:[],tables:{}};
    #rectsMade = false;
    placeId;
    #layout = {areas:[],tables:{}};
    blinks={};
    #blinksMade;
    refs={};
    #selectedTable;
    #svgRef=createRef();
    #onSelect;
    static layoutCache={};
    constructor(props){
        super(props);
        const placeId = this.placeId = props.placeId;
        this.#onSelect = props.onTableSelect;
        this.state = {
            placeId,
            layout:this.#layout,
            viewOnly:!!props.viewOnly,
            selectedTable:props.selectedTable
        }
        this.#selectedTable = props.selectedTable;
        if(props.onLayoutParsed)this.on("layout-parsed",props.onLayoutParsed);
        //window.f = (...args)=>this.getTableBlinks(...args);

        LayoutSVG.fetchLayoutForPlace(placeId).then(r=>{
            if(!Array.isArray(r.areas)||(!r.tables instanceof Object)){
                this.#layout=false;
                return this.forceUpdate();
            }
            this.#rectsMade = false;
            this.#blinksMade = false;
            this.#layout = r;
            
            const defaultColor = "gray";
            for (let t of Object.keys(r.tables)){
                r.tables[t].id = t;
                if(!this.blinks[t])this.blinks[t] = {from:defaultColor,to:defaultColor};
            }
            this.state.layout = r;
            this.state.selectedTable = props.selectedTable;
            this.do("layout-loaded");

            this.makeRects();
        });
        LayoutSVG.instance = this;
    }
    static async fetchLayoutForPlace(placeId){
        if(this.layoutCache[placeId])return this.layoutCache[placeId];
        else return API(`/place/layout/${placeId}`).catch(e=>e).then(r=>this.layoutCache[placeId]=r)
    }
    get layout(){
        return this.#layout;
    }
    get selectedTable(){
        return this.#selectedTable;
    }
    set selectedTable(v){
        if(this.state.viewOnly)return;
        if(this.#rects.tables[this.#selectedTable])this.#rects.tables[this.#selectedTable].ref.current.selected = false;

        const el = this.#rects.tables[v]?.ref.current;
        this.#selectedTable = v;
        if(el)el.selected = true;
        
        if(this.#onSelect)this.#onSelect(v);
        this.setState({
            selectedTable:v
        });
        this.do("table-select",v,el);
    }
    get element(){
        return this.#svgRef.current;
    }
    setBlink(table,from,to){
        this.blinks[table] = {from,to};
        if(this.refs[table]&&this.refs[table].current)
            this.refs[table].current.setState({blink:{from,to}})
        this.forceUpdate();
    }
    componentDidMount(){
        this.on("layout-loaded",()=>this.forceUpdate(),true);
    }
    componentDidUpdate(){
        if(!this.#blinksMade){
            this.do("layout-parsed");
            this.#blinksMade = true;
        }
    }
    makeRects(){
        const obj = this.#rects = {areas:[],tables:{}};
        let key = 0;
        for (let i of this.#layout.areas){
            obj.areas.push(
                <Area 
                    rect={i.rect}
                    tag={i.tag}
                    key={key}
                />
            )
            key++;
        }
        let tableSize = [95,80];
        for (let k of Object.keys(this.#layout.tables)){
            const i = this.#layout.tables[k];
            const tag = i.tag = "Table";
            const ref = this.refs[k] = createRef();

            obj.tables[k] = 

            <Table
                position={i.position}
                size={tableSize}
                tag={tag} key={k}
                id={i.id}
                blink={this.blinks[k]}
                ref={ref}
                selected={this.state.selectedTable==i.id}
                onclick={()=>this.selectedTable=k}
            />;

            key++;
        }
        this.#rectsMade = true;
        this.#blinksMade = false;
        return obj;
    }
    render(){
        if(!this.#rectsMade)return <div style={
            {
                height:"100%",
                textAlign:"center",
                display:"flex",
                flexDirection:"column",
                placeContent:"center",
                fontSize:"3em"
            }}>Εμφάνιση κάτοψης...</div>;

        return <svg 
        viewBox="-650 -310 1185 530"
        style={{width:"100%",height:"100%"}}
        xmlns="http://www.w3.org/2000/svg"
        ref={this.#svgRef}
        className={this.state.viewOnly?"view-only":null}
        onClick={e=>{
            e.target instanceof SVGSVGElement?this.selectedTable=false:null
        }}
        > 
            {this.#layout?
                [...this.#rects.areas,...Object.values(this.#rects.tables)]:
                <text x="-238" y="-90" style={{fontSize:"3em",dominantBaseline:"middle",textAlign:"center"}}>Δεν υπάρχει κάτοψη</text>
            }
        </svg>
    }
}
window.svg=LayoutSVG;