import React, { createRef } from "react";

export default class TestWindow extends React.Component{
    minX;
    minY;
    maxX;
    maxY;
    minWidth;
    minHeight;
    maxWidth;
    maxHeight;
    resizable=true;
    #mousePos=[];
    #startPos=[];
    #dragging=false;
    #locked=false;
    #visible = true;
    #title;
    #resizeRadius=6;
    #ref=createRef();
    constructor(props){
        super(props);
        
        this.minX = Number(props.minX)||0;
        this.minY = Number(props.minY)||0;
        this.maxX = Number(props.maxX)||innerWidth-1;
        this.maxY = Number(props.maxY)||innerHeight-1;
        this.minWidth = Number(props.minWidth)||0;
        this.minHeight = Number(props.minHeight)||0;
        this.maxWidth = Number(props.maxWidth)||Infinity;
        this.maxHeight = Number(props.maxHeight)||Infinity;
        this.#title=props.title||"";
        this.#visible = !props.hidden
        
        this.state = {
            x:Math.max(Number(props.x)||0,this.minX),
            y:Math.max(Number(props.y)||0,this.minY),
            w:Math.min(Math.max(Number(props.width)||0,0,this.minWidth),this.maxWidth),
            h:Math.min(Math.max(Number(props.height)||0,0,this.minHeight),this.maxHeight),
            title:this.#title,
            locked:false,
            visible:this.#visible
        };
        addEventListener("mousemove",e=>this.mouseMove(e.clientX,e.clientY));
        addEventListener("mouseup",e=>this.mouseUp());
    }
    set title(v){
        this.#title=v||"";
    }
    set x(v){
        v=Math.max(Number(v),this.minX);
        if(v||v==0)this.setState({x:v});
    }
    set y(v){
        v=Math.max(Number(v),this.minY);
        if(v||v==0)this.setState({y:v});
    }
    get x(){
        return this.state.x;
    }
    get y(){
        return this.state.y;
    }
    get currentWidth(){
        return this.width||(this.#ref?this.#ref.current.clientWidth:undefined);
    }
    get currentHeight(){
        return this.height||(this.#ref?this.#ref.current.clientHeight:undefined);
    }
    moveTo(x,y){
        if(this.#locked)return;
        if(!this.maxX)this.maxX=innerWidth;
        if(!this.maxY)this.maxY=innerHeight;
        return this.setState({
            x: Math.min(Math.max(x,this.minX),this.maxX-this.currentWidth-1),
            y: Math.min(Math.max(y,this.minY),this.maxY-this.currentHeight-1)
        })
    }
    mouseDown(x,y){
        this.#mousePos = [x,y];
        this.#startPos = [this.x,this.y];
        this.#dragging = true;
    }
    mouseUp(){
        this.#dragging=false;
    }
    toggleVisibility(){
        this.setState({
            visible:this.#visible=!this.#visible
        });
    }
    mouseMove(x,y){

        if(this.#dragging){
            const tx = x - this.#mousePos[0] + this.#startPos[0];
            const ty = y - this.#mousePos[1] + this.#startPos[1];

            this.moveTo(tx,ty);
        }
    }
    resize(w,h){
        if(this.#locked||!this.resizable)return;
        if(!this.maxWidth)this.maxWidth=innerWidth;
        if(!this.maxHeight)this.maxHeight=innerHeight;
        this.setState({
            w: Math.min(Math.max(w,this.minWidth,0),this.maxWidth),
            h: Math.min(Math.max(h,this.minHeight,0),this.maxHeight),
            //x: Math.min(Math.max(this.state.x,this.minX),this.maxX-this.currentWidth-1),
            //y: Math.min(Math.max(this.state.y,this.minY),this.maxY-this.currentHeight-1)
        });
    }
    setLocked(locked){
        this.#locked=!!locked;
        this.setState({locked:!!locked});
    }
    #LockSVG({locked}){
        return locked?
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25.5">
                <path fillRule="evenodd" clipRule="evenodd" 
                    d="M18 10.5C19.6569 10.5 21 11.8431 21 13.5V19.5C21 21.1569 19.6569 22.5 18 22.5H6C4.34315 22.5 3 21.1569 3 19.5V13.5C3 11.8431 4.34315 10.5 6 10.5V7.5C6 4.18629 8.68629 1.5 12 1.5C15.3137 1.5 18 4.18629 18 7.5V10.5ZM12 3.5C14.2091 3.5 16 5.29086 16 7.5V10.5H8V7.5C8 5.29086 9.79086 3.5 12 3.5ZM18 12.5H6C5.44772 12.5 5 12.9477 5 13.5V19.5C5 20.0523 5.44772 20.5 6 20.5H18C18.5523 20.5 19 20.0523 19 19.5V13.5C19 12.9477 18.5523 12.5 18 12.5Z" 
                    fill="#000000"/>
            </svg>:
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 25">
                <path 
                    d="M19 7H17C17 4.79086 15.2091 3 13 3C10.7909 3 9 4.79086 9 7V10H18C19.6569 10 21 11.3431 21 13V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V13C3 11.3431 4.34315 10 6 10H7V7C7 3.68629 9.68629 1 13 1C16.3137 1 19 3.68629 19 7ZM18 12H6C5.44772 12 5 12.4477 5 13V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V13C19 12.4477 18.5523 12 18 12Z" 
                    fill="#000000"/>
            </svg>;
    }
    render(){
        const LockSVG = p=>this.#LockSVG(p);
        const style = {
            top:this.state.y+"px",
            left:this.state.x+"px",
            visibility:this.state.visible?"visible":"hidden"
        }
        if(this.state.w)style.width=this.state.w+"px";
        if(this.state.h)style.height=this.state.h+"px";

        return <div className="floating-window" ref={this.#ref} style={style} onMouseMove={e=>this.mouseMove(e.clientX,e.clientY)}>
            <div className="top" onMouseDown={e=>this.mouseDown(e.clientX,e.clientY)}>
                <div className="left-buttons">
                    <div onClick={()=>this.setLocked(!this.#locked)}>
                        <LockSVG locked={this.#locked}/>
                    </div>
                </div>
                <div className="window-title">
                    {this.state.title}
                </div>
                <div className="right-buttons">
                    <button className="close" onClick={()=>this.toggleVisibility()}/>
                </div>
            </div>
            <div className="main-window">
                {this.props.children}
            </div>
        </div>
    }
}