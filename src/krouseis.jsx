import React from "react";

function Arrow({ x, y, l=100 }) {
    x=Number(x);y=Number(y);l=Number(l);
    if(l==0)return null;
    const factor = 5;
    const headSize = l/factor;
    const endX = x + l;

    const path = `
    M ${x} ${y}
    L ${endX} ${y}
    M ${endX} ${y}
    L ${endX - headSize} ${y - l/factor}
    M ${endX} ${y}
    L ${endX - headSize} ${y + l/factor}
    `;

    return <path d={path} stroke="blue" strokeWidth="3" fill="none" />;
}

export default class CollisionSimulator extends React.Component{
    #viewBox=[0,0,1000,1000];
    #circles=[
        {mass:50,speed:100,start:100},
        {mass:100,speed:0,start:500}
    ];
    #circlePos=[100,150];
    #startTime=0;
    #vs=[];
    #cpos;
    #moment;
    #timeScale = 100;
    #playing = false;
    constructor(props){
        super(props);

        this.calculateMoments();

        this.state = {
            viewBox:this.#viewBox,
            circlePos:this.#circlePos
        }
    }
    calculateMoments(){
        //Στιγμή κρούσης
        const moment = this.#moment = (this.#circles[1].start-this.#circles[0].start)/(this.#circles[0].speed-this.#circles[1].speed);
        //Θέση κρούσης
        const x = this.#circles[0].start+moment*this.#circles[0].speed;
        const f1 = (this.#circles[0].mass-this.#circles[1].mass)/(this.#circles[0].mass+this.#circles[1].mass);
        const f2 = 2/(this.#circles[0].mass+this.#circles[1].mass);

        const v1 = f1*this.#circles[0].speed+f2*this.#circles[1].mass*this.#circles[1].speed;
        const v2 = f2*this.#circles[0].mass*this.#circles[0].speed-f1*this.#circles[1].speed;

        this.#vs=[v1,v2];
        this.#cpos = x;
        this.#startTime = performance.now();
    }
    stop(){
        this.#startTime=performance.now();
        this.#time(0);
        this.#playing=false;
    }
    start(){
        this.#playing = true;
        this.#startTime=performance.now();
        this.#time(this.#startTime);
    }
    #set(circle,massOrSpeed,e){
        let v = e.target.value;
        if(v=="-"||v=="0"||v==""||v==".")return v;
        v=Number(v);
        if(!v&&v!=0)return "";

        if(circle==2)return this.#timeScale=v;
        v = this.#circles[circle][massOrSpeed?"mass":"speed"]=v||0;
        this.calculateMoments();
        return v;
    }
    componentDidMount(){
        this.#startTime = performance.now();
        this.#time(this.#startTime);
    }
    #time(t){
        if(t<this.#moment){
            this.setState({
                time:t,
                circlePos:[
                    this.#circles[0].start+t*this.#circles[0].speed,
                    this.#circles[1].start+t*this.#circles[1].speed
                ]
            });
        }
        else{
            this.setState({
                time:t,
                circlePos:[
                    this.#cpos+(t-this.#moment)*this.#vs[0],
                    this.#cpos+(t-this.#moment)*this.#vs[1],
                ]
            })
        }
        if(this.#playing)requestAnimationFrame(t=>this.#time((t-this.#startTime)*this.#timeScale/100000));
    }
    render(){
        const r = 25;
        const vectorScale = 0.5;
        const x1 = this.state.circlePos[0]-r;
        const x2 = this.state.circlePos[1]+r;
        const v1 = this.state.time>this.#moment?this.#vs[0]:this.#circles[0].speed;
        const v2 = this.state.time>this.#moment?this.#vs[1]:this.#circles[1].speed;
        const style = {width:"50px"};
        return <div style={{width:"100%",height:"100%"}}>
            <svg viewBox={this.state.viewBox.join(" ")} style={{width:"100%",height:"calc(100% - 4px)"}}>
                <style>{`text{dominant-baseline:middle;text-anchor:middle;font-size:14px}`}</style>
                <g>
                    <circle cx={x1} cy="200" r={r} fill="red"/>
                    <text x={x1} y="200">{this.#circles[0].mass}kg</text>
                    <text x={x1} y="250">{v1.toFixed(3)}px/s</text>
                    <text x={x1} y="150">{x1.toFixed(3)}px</text>
                    <Arrow x={x1} y={200+r} l={v1*vectorScale}/>
                </g>
                <g>
                    <circle cx={x2} cy="200" r={r} fill="green"/>
                    <text x={x2} y="200">{this.#circles[1].mass}kg</text>
                    <text x={x2} y="250">{(this.state.time>this.#moment?this.#vs[1]:this.#circles[1].speed).toFixed(3)}px/s</text>
                    <text x={x2} y="150">{x2.toFixed(3)}px</text>
                    <Arrow x={x2} y={200+r} l={v2*vectorScale}/>
                </g>
                <text x={(x1+x2)/2} y="400">t={(this.state.time||0).toFixed(2)}sec</text>
            </svg>
            <div style={{position:"fixed",bottom:0,left:0,padding:"15px"}}>
                <button onClick={()=>this.start()}>Start</button>
                <button onClick={()=>this.stop()}>Stop</button><br/>
                Χρονική ταχύτητα:<input style={style} onChange={e=>e.target.value=this.#set(2,false,e)} defaultValue={100}/>%<br/>
                m1:<input style={style} onChange={e=>e.target.value=this.#set(0,true,e)} defaultValue="50"/>kg<br/>
                m2:<input style={style} onChange={e=>e.target.value=this.#set(1,true,e)} defaultValue="100"/>kg<br/>
                v1:<input style={style} onChange={e=>e.target.value=this.#set(0,false,e)} defaultValue="5"/>m/s<br/>
                v2:<input style={style} onChange={e=>e.target.value=this.#set(1,false,e)} defaultValue="-1"/>m/s<br/>
                <span style={{fontSize:"10px"}}>(Θανάσης Μπαρτζώκας - 2025 - 1m = 100 pixel)</span>
            </div>
        </div>
    }
}