import React, { createRef } from "react";
import { EventComponent } from "../common/Event";

class EditorArea extends React.Component{
    #clickF;id;
    lastPos;moving;
    lastSize;moving;
    change;delete;
    tag;
    static boundingBoxSize = 25;
    #div;
    constructor(props){
        super(props);
        this.tag=props.tag;
        this.state={
            position:this.props.position,
            size:this.props.size
        };
        this.#clickF = props.onClick;
        this.change = props.change;
        this.delete = props.delete;
        if(LayoutEditor.instance.loaded)this.initEvs(LayoutEditor.instance.divRef.current);
        else LayoutEditor.instance.on("load",div=>this.initEvs(div));
    }
    initEvs(div){
        div.addEventListener("mousemove",this.#mmf);
        div.addEventListener("mouseup",e=>this.resizing=this.moving=false);
        div.addEventListener("mouseleave",e=>this.resizing=this.moving=false);
        this.#div=div;
    }
    moveTo(pos){
        const position = LayoutEditor.instance.getNearestToGrid(...pos);
        if(position[0]==this.state.position[0]&&position[1]==this.state.position[1])return;
        const changeObj = {position};
        this.setState(changeObj);
        this.change(changeObj);
    }
    resizeTo(pos){
        const min = LayoutEditor.instance.gridIncrement;
        const targetPos = LayoutEditor.instance.getNearestToGrid(...pos);
        const size = [
            Math.max(targetPos[0]-this.state.position[0],min),
            Math.max(targetPos[1]-this.state.position[1],min)
        ]
        if(size[0]==this.state.size[0]&&size[1]==this.state.size[1])return;
        this.setState({size})
        this.change({size})
    }
    #deleteListener = e=>e.key=="Delete"?this.delete():console.log(e.key);
    select(){
        this.setState({selected:true})
        addEventListener("keydown",this.#deleteListener);
    }
    unselect(){
        this.setState({selected:false})
        removeEventListener("keydown",this.#deleteListener);
    }
    onClick(e){
        LayoutEditor.instance.select(this);
    }
    BoundingBox({cx,cy,...props}){
        const ratio = 1/LayoutEditor.instance.pixelToWorldRatio;
        return <rect 
                x={cx-ratio*EditorArea.boundingBoxSize/2} 
                y={cy-ratio*EditorArea.boundingBoxSize/2} 
                width={ratio*EditorArea.boundingBoxSize} 
                height={ratio*EditorArea.boundingBoxSize} 
                fill="white"
                strokeWidth={ratio*2}
                stroke="black"
                {...props}
            />
    }
    #mmf = e=>this.onMouseMove(e);
    componentWillUnmount(){
        this.#div.removeEventListener("mousemove",this.#mmf);
    }
    onMouseMove(e){
        if(this.moving){
            this.moveTo(LayoutEditor.instance.screenToWorld(e.offsetX,e.offsetY))
        }
        if(this.resizing)this.resizeTo(LayoutEditor.instance.screenToWorld(e.offsetX,e.offsetY));
    }
    render(){
        const position = this.state.position;
        const size = this.state.size;
        return <g onMouseDown={e=>this.onClick(e)}>
            <rect 
                x={position[0]} 
                y={position[1]} 
                width={size[0]}
                height={size[1]}
                className={"layout-area "+this.tag||""}
                id={this.id}
            />
            {this.state.selected?
            <this.BoundingBox 
                cx={position[0]}
                cy={position[1]}
                style={{cursor:"move"}}
                onMouseDown={e=>this.moving=true}
            />
            :null}

            {this.state.selected?
            <this.BoundingBox 
                cx={position[0]+size[0]}
                cy={position[1]+size[1]}
                style={{cursor:"nw-resize"}}
                onMouseDown={e=>this.resizing=true}
            />
            :null}
            <text>
                {this.id}
            </text>
        </g>
    }
}

// class Table extends EventComponent{
//     #id;#onclick;#selected;#ref=createRef();#rectRef=createRef();
//     constructor(props){
//         const {position,size,tag,id,blink,onclick} = props;
//         super(props);

//         this.#id = id;
//         this.#onclick=onclick;
//         this.state = {
//             position,
//             size,
//             tag,
//             blink
//         };
//     }
//     get id(){return this.#id}
//     set blink(v){
//         this.setState({blink:v})
//     }
//     get selected(){
//         return this.#selected;
//     }
//     set selected(v){
//         this.#selected = v;
//         this.setState({selected:v});
//     }
//     render(){
//         const {position,size,tag,blink,selected} = this.state;
//         return <g onClick={this.#onclick} ref={this.#ref}>
//             <rect 
//                 x={position[0]-size[0]/2} 
//                 y={position[1]-size[1]/2} 
//                 width={size[0]} 
//                 height={size[1]} 
//                 className={tag+(selected?" blink selected":" blink")} 
//                 id={this.#id}
//                 style={{
//                     "--default-color":blink.from,
//                     "--blink-color":blink.to
//                 }}
//                 ref={this.#rectRef}
//             />
//             <text 
//                 x={position[0]} 
//                 y={position[1]} 
//                 textAnchor="middle" 
//                 dominantBaseline="middle" 
//                 fontSize="18"
//             >
//                 {this.#id}
//             </text>
//         </g>;
//     }
// }

function CrossPath({ x, y, edgeSize, ...props }) {
  const e = edgeSize;

  const d = `
    M ${x - e} ${y}
    L ${x + e} ${y}
    M ${x} ${y - e}
    L ${x} ${y + e}
  `;

  return <path d={d} {...props} />;
}

export default class LayoutEditor extends EventComponent{
    /**
     * @type {LayoutEditor}
     */
    static instance;
    #camPos=[0,0];
    #camScale;
    areas=[];
    divRef=createRef();
    gridIncrement = 1;
    loaded=false;
    constructor(props){
        super(props);
        this.state = {
            viewBox:[0,0,1,1],
            testerPos:[0,0]
        }
        LayoutEditor.instance = this;
    }
    get tableSize(){
        return [80,60];
    }
    get camPos(){
        return this.#camPos;
    }
    set camPos(v){
        this.#camPos = v;
        this.realign();
    }
    get camScale(){
        return this.#camScale;
    }
    set camScale(v){
        if(!Number(v))return;
        this.#camScale = v;
        this.realign();
    }
    get pixelToWorldRatio(){
        if(!this.#screenSize)return 0;
        return this.#screenSize[1]/this.#camScale/2;
    }
    #selected=false;
    select(item){
        if(this.#selected)this.#selected.unselect();
        if(item)item.select();
        this.#selected = item;
    }
    #screenSize;
    realign(){
        const div = this.divRef.current;
        this.#screenSize = [div.clientWidth,div.clientHeight];
        const aspectRatio = this.#screenSize[0]/this.#screenSize[1];
        const rangeY = [this.#camPos[1]-this.#camScale,this.#camPos[1]+this.#camScale];
        const rangeX = [this.#camPos[0]-this.#camScale*aspectRatio,this.#camPos[0]+this.#camScale*aspectRatio];
        const viewBox = [rangeX[0],rangeY[0],(rangeX[1]-rangeX[0]),(rangeY[1]-rangeY[0])];
        this.setState({viewBox});
    }
    #lastPos = [0,0];
    #mouseDown = false;
    #mousePos = [0,0];
    applyMove(){
        const startPos = this.#mouseDown;
        //Find the change in position from the start of the move action in pixels
        const deltaPos = [startPos[0]-this.#mousePos[0],startPos[1]-this.#mousePos[1]];

        //Get the ratio pixels to world units
        const ratio = this.pixelToWorldRatio;
        this.camPos = [this.#lastPos[0]+deltaPos[0]/ratio,this.#lastPos[1]+deltaPos[1]/ratio];
    }
    screenToWorld(x,y){
        //Find the pixel distance from the screen center
        const deltaFromScreenCenter = [x-this.#screenSize[0]/2,y-this.#screenSize[1]/2];
        //Find the ratio of pixels to world units
        const ratio = this.pixelToWorldRatio;
        //Find the equivalent distance from the world center
        const deltaFromWorldCenter = [deltaFromScreenCenter[0]/ratio,deltaFromScreenCenter[1]/ratio];
        return [this.#camPos[0]+deltaFromWorldCenter[0],this.#camPos[1]+deltaFromWorldCenter[1]];
    }
    #resizeF=()=>this.forceUpdate();
    componentDidMount(){
        this.addArea([0,0])
        this.camScale = 1;
        this.do("load",this.divRef.current);
        this.loaded=true;
        window.addEventListener("resize",this.#resizeF);
    }
    componentWillUnmount(){
        window.removeEventListener("resize",this.#resizeF);
    }
    #zoom = 0;
    get zoom(){return this.#zoom}
    set zoom(v){
        if(v>20||v<0)return;
        this.#zoom = v;
        this.#camScale = (1.2)**v;
        this.realign();
    }
    getNearestToGrid(x,y){
        const g = this.gridIncrement;
        return [Math.round(x/g)*g,Math.round(y/g)*g];
    }
    getPreviousOnGrid(x,y){
        const g = this.gridIncrement;
        return [Math.floor(x/g)*g,Math.floor(y/g)*g];
    }
    getNextOnGrid(x,y){
        const g = this.gridIncrement;
        return [Math.ceil(x/g)*g,Math.ceil(y/g)*g];
    }
    grid(){
        const SIZE = 2;
        const ratio = 1/this.pixelToWorldRatio;
        const box = [...this.state.viewBox];
        const first = this.getPreviousOnGrid(box[0],box[1]);
        const last = this.getNextOnGrid(box[0]+box[2],box[1]+box[3]);
        const posArr = [];
        let d = "";
        for(let x=first[0];x<=last[0];x+=this.gridIncrement)
            d += `M ${x} ${first[1]} L ${x} ${last[1]}`;
        for(let y=first[1];y<=last[1];y+=this.gridIncrement)
            d += `M ${first[0]} ${y} L ${last[0]} ${y}`;

        return <path d={d} stroke="black" strokeWidth={ratio} opacity={0.5}/>
    }
    addArea(startingPos=[0,0],startingSize=[1,1],tag="Building"){
        const y=0;
        //Make each area object contain the info required for the area and a function that can change that data
        const obj={
            position:startingPos,
            size:startingSize,
            tag,
            //Syntax like setState: for each key provided, update that key
            change:o=>Object.keys(o).forEach(k=>obj[k]=o[k]),
            delete:()=>(this.areas[y].splice(this.areas[y].indexOf(obj),1),this.forceUpdate())
        }
        if(Array.isArray(this.areas[y]))this.areas[y].push(obj);
        else this.areas[y] = [obj];
        this.forceUpdate();
    }
    render(){
        const f=e=>[e.nativeEvent.offsetX,e.nativeEvent.offsetY];
        return <div className="editor-container" ref={this.divRef} >
            <EditorButtons/>
            <svg 
            viewBox={this.state.viewBox} 
            style={{maxHeight:"100%"}}
            onMouseMove={e=>{
                if(!this.#mouseDown)return;
                this.#mousePos = f(e);
                this.applyMove();
            }} 
            onMouseDown={e=>{
                if(e.target instanceof SVGRectElement||e.target instanceof SVGTextElement)return;
                this.#lastPos = this.#camPos;
                this.#mouseDown = f(e);
                this.select(false);
            }}
            onMouseUp={()=>this.#mouseDown=false}
            onMouseLeave={()=>this.#mouseDown=false}
            onWheel={e=>this.zoom+=Math.sign(e.deltaY)}>
                {this.grid()}
                {Object.values(this.areas).flatMap(z=>
                    z.map((r,i)=>
                        <EditorArea {...r} key={Math.random()}/>
                    )
                )}
            </svg>
            <div className="center-cross">+</div>
        </div>
    }
}

function EditorButtons(){
    const obj = ["WC","Bar","Kitchen"];
    return <div className="layout-editor-buttons-container">
            {obj.map(k=>
                <button onClick={()=>LayoutEditor.instance.addArea([0,0],[1,1],k)}>{k}</button>
            )}
    </div>
}

window.LayoutEditor = LayoutEditor;