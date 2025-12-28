import React, { createRef } from "react";

const _pmul = e=>[e.clientX*devicePixelRatio,e.clientY*devicePixelRatio];
const _pdiv = e=>[e.clientX/devicePixelRatio,e.clientY/devicePixelRatio];

class LayoutDesignerArea extends React.Component{
    #startPos=[];
    #startConditions;
    #dragging=false;
    #dragType=0;//0:moving 1:resizing
    #parent;
    #gridSnap;
    constructor(props){
        super(props);
        this.#parent = props.parent;
        this.#gridSnap=this.#parent.gridSnap;
        this.state = {
            selected:false,
            x:Number(props.x),
            y:Number(props.y),
            w:Number(props.width)||10,
            h:Number(props.height)||10,
            tag:props.tag,
            c:"black",
            selected:false
        }
        window.addEventListener("mousemove",e=>this.#dragging?this.dragTo(e.offsetX,e.offsetY):null);
        window.addEventListener("mouseup",e=>this.#dragging?this.stopDrag():null);
    }
    set selected(v){
        this.setState({selected:!!v})
    }
    get selected(){return this.state.selected}
    moveTo(x,y){
        const snap = this.#gridSnap;
        x = Math.round(x/snap)*snap;
        y = Math.round(y/snap)*snap;
        return this.setState({
            x,y
        });
    }
    resize(w,h){
        const snap = this.#gridSnap;
        w = Math.max(Math.round(w/snap),1)*snap;
        h = Math.max(Math.round(h/snap),1)*snap;
        return this.setState({
            w,h
        });
    }
    dragTo(x,y){
        const c = [
            this.#startConditions[0]+x-this.#startPos[0], 
            this.#startConditions[1]+y-this.#startPos[1]
        ];

        switch (this.#dragType){
            case 0:
                this.moveTo(...c)
                break;
            case 1:
                this.resize(...c)
                break;
        }
    }
    startDrag(x,y,mode){
        this.#startPos=[x,y];
        this.#dragging=true;
        this.#dragType=mode;
        switch(mode){
            case 0:
                document.body.style.cursor = "move";
                return this.#startConditions = [this.state.x,this.state.y];
            case 1:
                document.body.style.cursor = "se-resize";
                return this.#startConditions = [this.state.w,this.state.h];
        }
    }
    stopDrag(){
        document.body.style.cursor = "";
        this.#dragging=false;
        requestAnimationFrame(()=>this.#parent.selectChild(this))
    }
    export(){
        return {
            tag:this.state.tag||"area",
            rect:[
                this.state.x,
                this.state.y,
                this.state.w,
                this.state.h
            ]
        };
    }
    render(){
        const {x,y,w,h,c} = this.state;
        return <g className="layout-area">
            <rect 
                x={x}
                y={y}
                width={w}
                height={h}
                fill={c}
                className={"main-area"+(this.state.selected?" selected":"")}
                onClick={e=>requestAnimationFrame(()=>this.#parent.selectChild(this))}
            />
            {this.state.selected?
            <rect 
                x={x-5}
                y={y-5}
                width={10}
                height={10}
                fill={c}
                style={{cursor:"move"}}
                className="expander"
                onMouseDown={e=>this.startDrag(e.clientX,e.clientY,0)}
            />:null}
            {this.state.selected?<rect 
                x={x+w-5}
                y={y+h-5}
                width={10}
                height={10}
                fill={c}
                style={{cursor:"se-resize"}}
                className="expander"
                onMouseDown={e=>this.startDrag(e.clientX,e.clientY,1)}
            />:null}
        </g>
    }
}

class LayoutDesignerTable extends React.Component{
    #parent;
    #dragging=false;
    #startDelta;
    #startMouse;
    #gridSize;
    #stateRef;
    constructor(props){
        super(props);
        this.#parent = props.parent;
        this.state = {
            x:Number(props.x)||0,
            y:Number(props.y)||0,
            tag:props.tag||"Table",
            w:50,
            h:30
        }
        this.#gridSize = this.#parent.gridSnap;
        window.addEventListener("mousemove",e=>this.#dragging?this.dragTo(e.clientX,e.clientY):null);
        window.addEventListener("mouseup",e=>this.#dragging?this.stopDrag():null);
    }
    set x(v){
        if(Number(v)||v==0)this.setState({x:v})
    }
    set y(v){
        if(Number(v)||v==0)this.setState({y:v})
    }
    set selected(v){
        this.setState({selected:!!v})
    }
    get selected(){return this.state.selected}
    stopDrag(){
        this.#dragging = false;
    }
    mouseDown(x,y){
        requestAnimationFrame(()=>this.#parent.hit(this));
        if(this.selected){
            this.#dragging = true;
            this.#startDelta = [this.state.x-x,this.state.y-y];
        }
    }
    dragTo(x,y){
        x += this.#startDelta[0];
        y += this.#startDelta[1];

        const snap = this.#gridSize;
        x = Math.round(x/snap)*snap;
        y = Math.round(y/snap)*snap;

        this.setState({
            x,
            y
        });
    }
    export(){
        return {
            tag:this.state.tag,
            pos:[this.state.x,this.state.y]
        };
    }
    render(){
        //this.#stateRef.current = this.state;
        const {x,y,w,h,tag,selected} = this.state;
        return <g className="layout-table"
            onMouseDown={e=>this.mouseDown(e.clientX,e.clientY)}
            onClick={e=>requestAnimationFrame(()=>this.#parent.selectChild(this))}
        >
            <rect
                x={x}
                y={y}
                className={tag+(selected?" selected":"")}
            />
            <text 
                x={x+w/2}
                y={y+h/2}
            >{tag}</text>
        </g>
    }
}

class _LayoutDesigner extends React.Component{
    #mouse=[0,0];
    gridSnap = 50;
    #selected;
    #hitTarget=false;
    #stateRef;
    #data={
        areas:[],
        tables:[]
    }
    static instance;
    constructor(props){
        super(props);
        _LayoutDesigner.instance = this;

        //Number in variable lol
        const ref1 = createRef();
        const ref2 = createRef();
        this.#data.areas.push(ref1);
        this.#data.tables.push(ref2);

        const state = {
            viewBox:[-800,-500,innerWidth,innerHeight-4],
            areas:{"Kitchen":[<LayoutDesignerArea x="10" y="50" width="100" height="100" key="0" tag="Kitchen" parent={this} ref={createRef()}/>]},
            tables:[<LayoutDesignerTable x="15" y="20" tag="Table" key="0" parent={this} ref={createRef()}/>]
        };
        if(props.ref){
            this.#stateRef = props.ref;
            props.ref.current = state;
        }
        this.state = state;
    }
    hit(target){
        if(target)this.#hitTarget = true;
    }
    selectChild(child){
        if(this.#selected)this.#selected.selected = false;
        this.#selected = child;
        if(child){
            this.#hitTarget = true;
            child.selected = true;
        }
    }
    mouseMove(x,y){
        this.#mouse=[x,y];
    }
    mouseDown(x,y){
        this.#hitTarget = false;
    }
    mouseUp(x,y){
        if(!this.#hitTarget)this.selectChild(null);
    }
    addArea(...a){
        this.setState({
            areas:[...this.state.areas,...a]
        })
    }
    addTable(...t){
        this.setState({
            tables:[...this.state.tables,...t]
        })
    }
    newTable(){
        this.addTable(<LayoutDesignerTable key={this.state.tables.length} x={50} y={50} parent={this} ref={createRef()}/>)
    }
    newArea(x=50,y=100,w=100,h=100,tag="area"){
        this.addArea(<LayoutDesignerArea key={this.state.areas.length} x={x} y={y} width={w} height={h} tag={tag} parent={this} ref={createRef()} />)
    }
    import(data){
        if(!data.areas)data.areas={};
        if(!data.tables)data.tables={};
        const zOrder = ["Building","WC","Kitchen","Bar"];
        let id=0;
        const areas={};

        for(let i of zOrder){
            if(!Array.isArray(data.areas[i]))continue;
            console.log(data.areas[i])
            areas[i] = data.areas[i].map(a=><LayoutDesignerArea key={id++} x={a[0]} y={a[1]} width={a[2]} height={a[3]} tag={i} parent={this} ref={createRef()}/>)
        }

        const tables={};
        for(let i of Object.keys(data.tables)){
            const tbl = data.tables[i];
            const tag = Object.keys(tbl)[0];
            const pos = Object.values(tbl)[0];

            tables[i] = <LayoutDesignerTable key={i} x={pos[0]} y={pos[1]} tag={tag} parent={this} ref={createRef()}/>
        }
        this.setState({areas,tables});
        // const areas = data.areas.map((r,i)=>{
        //     return <LayoutDesignerArea key={i} x={r.rect[0]} y={r.rect[1]} width={r.rect[2]} height={r.rect[3]} tag={r.tag} parent={this} ref={createRef()}/>
        // });
        // const state = {
        //     areas:areas,
        //     tables:Object.values(data.tables).map((r,i)=><LayoutDesignerTable key={i} x={r.position[0]} y={r.position[1]} tag={r.tag} parent={this} ref={createRef()}/>)
        // };
        // this.setState(state);
    }
    export(){
        return {
            areas:this.state.areas.map(r=>r.props.ref.current.export()),
            tables:this.state.tables.map(r=>r.props.ref.current.export())
        }
    }
    render(){
        const areas = this.state.areas;
        const areasList = Object.keys(areas).map((l,i)=>
            <g key={i} id={l}>
                {areas[l]}
            </g>
        )
        return <svg 
            viewBox={this.state.viewBox}
            style={{width:"100%",height:"100%"}}
            xmlns="http://www.w3.org/2000/svg"
            onMouseDown={e=>this.mouseDown(..._pmul(e))}
            onMouseMove={e=>this.mouseMove(..._pmul(e))}
            onMouseUp={e=>this.mouseUp(..._pmul(e))}
        > 
        {areasList}
        {Object.values(this.state.tables)}
        </svg>
    }
}

export default class LayoutDesigner extends React.Component{
    #self;
    constructor(props){
        super(props);
        this.#self = <_LayoutDesigner ref={createRef()}/>
    }
    render(){
        return <div style={{height:"calc(100% - 4px)"}}>
            {this.#self}
        </div>
    }
}
window.addTable = function(){
    _LayoutDesigner.instance.newTable();
}
window.addArea = function(){
    _LayoutDesigner.instance.newArea();
}
window.LayoutDesigner = _LayoutDesigner;