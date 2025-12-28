import React, { createRef } from "react";
import OwnerApp2 from "./App2";

class WorkerDraggable extends React.Component{
    constructor(props){
        super(props);
        let [_name,x,y]=[props._name,props.x,props.y];
        this.state={x,y,_name,visible:false};
    }
    set x(x){this.setState({x})}
    set y(y){this.setState({y})}
    set pos(xy){this.setState({x:xy[0],y:xy[1]})}
    set visible(visible){this.setState({visible})}
    render(){
        return <div style={{
            visibility:this.state.visible?"visible":"hidden",
            position:"fixed",
            top:this.state.y,
            left:this.state.x,
            transform:"translate(-50%,-50%)",
            background:"white",
            borderRadius:"5px",
            border:"1px solid",
            padding: "5px",
            pointerEvents:"none",
            zIndex:5
        }}>{this.state._name}</div>
    }
}

class WorkerUnit extends React.Component{
    #mouseDown=false;
    #draggable;
    #ref=createRef();
    constructor(props){
        super(props);
        this.#draggable = <WorkerDraggable _name={props._name} ref={this.#ref}/>
        this.state = {
            _name:props._name
        }
        addEventListener("mousemove",e=>this.mouseMove(e.clientX,e.clientY));
        addEventListener("mouseup",e=>{
            OwnerApp2.instance.draggingWorker = false;
            this.#mouseDown=false;
            if(this.#ref.current)this.#ref.current.visible = false;
        })
    }
    mouseDown(x,y){
        this.#mouseDown=[x,y];
        this.#ref.current.visible = true;
        OwnerApp2.instance.draggingWorker = this.state._name;

        this.mouseMove(x,y);
    }
    mouseMove(x,y){
        if(!this.#mouseDown)return;
        this.#ref.current.pos = [x+50,y-20]; //Approximation, I want to go top right of the mouse
    }
    render(){
        return <div 
        className="connection" 
        onMouseDown={e=>this.mouseDown(e.clientX,e.clientY)}
        >
            <div>{this.state._name}</div>
            {this.#draggable}
        </div>
    }
}

export class WorkersList extends React.Component{
    #workers=new Set();
    constructor(props){
        super(props);

        props.workers.forEach((name,index)=>this.#workers.add(<WorkerUnit _name={name} key={index}/>));
        this.state={
            workers:props.workers
        }
    }
    render(){
        return <div className="workers">
                {this.#workers}
            </div>;
    }
}