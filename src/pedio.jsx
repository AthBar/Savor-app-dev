import React from "react";
import { createRef } from "react";

const E_0 = 8.854 * 10**(-12);
const K = 1/(4*Math.PI*E_0);
window.K=K;

class Charge{
    #pos;
    charge;
    constructor(charge,x,y){
        this.#pos=[x,y]
        this.charge=charge;
    }
    get position(){return[...this.#pos]}
    get x(){return this.#pos[0]}
    get y(){return this.#pos[1]}
    set x(v){this.#pos[0]=v}
    set y(v){this.#pos[1]=v}

    valueOf(){return this.charge}
}

class ChargesSimulator{
    /**
     * @type {CanvasRenderingContext2D}
     */
    #ctx;
    #charges=new Set();
    #mouseDown;
    #startPos;
    #selected;
    #onTopOf;
    #keysDown={};
    constructor(cnv){
        this.#ctx=cnv.getContext("2d");
        
        addEventListener("keydown",e=>this.#keysDown[e.key]=true);
        addEventListener("keyup",e=>delete this.#keysDown[e.key]);
        addEventListener("click",e=>{console.log(this.#keysDown);

            if(!this.#onTopOf&&this.#keysDown.Control){
                const rand = Math.random()*6-3;
                this.addCharge(rand,e.clientX,e.clientY);
                this.draw();
            }
            if(this.#onTopOf&&this.#keysDown.Shift){console.log(this.#onTopOf)
                this.#charges.delete(this.#onTopOf);
            }
        })
        addEventListener("mousedown",e=>{
            let [x,y]=[e.clientX,e.clientY];
            if(this.#onTopOf){
                this.#mouseDown=[x,y];
                this.#selected=[this.#onTopOf.x,this.#onTopOf.y];
            }
        });
        addEventListener("mousemove",e=>{
            let [x,y]=[e.clientX,e.clientY];

            if(!this.#selected){
                let onSome=false;
                for(let i of this.#charges){
                    let d = Math.sqrt((i.x-x)**2+(i.y-y)**2);
                    if(d<10){
                        onSome=true;
                        if(!this.#onTopOf)this.#onTopOf=i;
                        break;
                    }
                }
                if(!onSome)this.#onTopOf=false;
            }

            if(!this.#selected)return;

            let [dx,dy]=[x-this.#mouseDown[0],y-this.#mouseDown[1]];
            this.#onTopOf.x=this.#selected[0]+dx;
            this.#onTopOf.y=this.#selected[1]+dy;
            this.draw(5);
        })
        addEventListener("wheel",e=>{
            if(this.#onTopOf){
                this.#onTopOf.charge += Math.sign(e.deltaY)/10;
                this.draw();
            }
        })
        addEventListener("mouseup",e=>{
            this.#selected=false;
            this.#onTopOf = false;
            this.draw();
        })
    }
    addCharge(charge,x,y){
        this.#charges.add(new Charge(charge,x,y));
    }
    drawCharges(){
        const RADIUS = 10;
        for(let i of this.#charges){
            this.#ctx.beginPath();
            this.#ctx.moveTo(i.x+RADIUS,i.y)
            this.#ctx.arc(i.x,i.y,RADIUS,0,Math.PI*2);
            
            const isZero = Math.abs(i)<0.05;
            this.#ctx.fillStyle = isZero?"gray":(i>0?"red":"blue"); //Using the valueOf to compare ;)
            this.#ctx.fill();

            this.#ctx.fillStyle = "white";
            const text = isZero?"0":((i>0?"+":"")+(i.charge.toFixed(1)))
            this.#ctx.fillText(text,i.x,i.y);
        }
    }
    drawLine(x,y,maxlength=3000,resolution=1,testCharge=1){
        let cx = x;
        let cy = y;
        let dist = 0;
        this.#ctx.beginPath();
        this.#ctx.moveTo(cx,cy);

        let finished=false;
        for(let i=0;dist<maxlength&&!finished;i+=resolution){
            //Total magnitude and deltas
            let tdx=0;
            let tdy=0;

            for(let charge of this.#charges){
                if(Math.abs(charge)<0.05)continue;
                
                const dx = cx-charge.x;
                const dy = cy-charge.y;
                const distance = Math.sqrt(dx**2+dy**2);
                if(distance<9.9){
                    finished=true;
                    break;
                }

                //Get Electric field strength algebraic value
                const strength = K*charge*testCharge/(distance**2);
                if(dx!=0){
                    const angleBetweenPathAndCharge = Math.atan2(dy,dx);

                    //Add to vector, deriving the total electic field force
                    let ax = Math.cos(angleBetweenPathAndCharge)*strength;
                    let ay = Math.sin(angleBetweenPathAndCharge)*strength;
                    
                    tdx += ax;
                    tdy += ay;
                }
                else tdy += strength*Math.sign(dy);
            }
            if(finished)break;
            const MAG = Math.sqrt((tdx)**2+(tdy)**2);

            cx += resolution*tdx/MAG;
            cy += resolution*tdy/MAG;
            
            dist = Math.sqrt((cx-x)**2+(cy-y)**2);
            
            this.#ctx.lineTo(cx,cy);
        }
        if(testCharge>0||testCharge<0&&!finished){
            this.#ctx.setLineDash((testCharge<0&&!finished)?[5,5]:[]);
            this.#ctx.strokeStyle = "white";
        }
        else this.#ctx.strokeStyle = "black"
        

        this.#ctx.stroke();
    }
    drawLines(charge,count=8,startAngle=0,resolution=1){
        const list = [];
        for(let i=0;i<count;i++){
            const theta = startAngle+Math.PI*2*(i/count);
            const x = charge.x+Math.cos(theta)*10;
            const y = charge.y+Math.sin(theta)*10;
            if(charge>0.05)this.drawLine(x,y,3000,resolution);
        }
    }
    draw(resolution=5){
        this.#ctx.clearRect(0,0,innerWidth,innerHeight);
        this.#ctx.textBaseline = "middle";
        this.#ctx.textAlign = "center";
        this.#ctx.font = "20px sans-serif";
        for(let i of this.#charges){
            this.drawLines(i,48,0,resolution);
        }
        this.drawCharges();
    }
}
export default class Pedio extends React.Component{
    #ref=createRef();
    #mgr;
    constructor(props){
        super(props);
        this.state = {w:innerWidth*devicePixelRatio,h:innerHeight*devicePixelRatio};
        document.body.style.overflow = "hidden";
        addEventListener("resize",()=>this.resize(innerWidth*devicePixelRatio,innerHeight*devicePixelRatio))
    }
    resize(w,h){
        this.setState({w,h});
        const cnv = this.#ref.current;
        [cnv.width,cnv.height]=[w,h];
        requestAnimationFrame(()=>this.#mgr.draw());
    }
    componentDidMount(){
        this.#mgr = new ChargesSimulator(this.#ref.current);
        this.#mgr.addCharge(-1,750,200);
        this.#mgr.addCharge(1,525,400);
        this.#mgr.addCharge(-2,325,200);
        this.#mgr.draw();
    }
    render(){
        const {w,h} = this.state;
        return <canvas style={{background:"black"}} width={w} height={h} ref={this.#ref}/>
    }
}