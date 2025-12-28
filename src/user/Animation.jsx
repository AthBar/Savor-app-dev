import { useEffect, useRef } from "react";
import UserAppClass from "./MainApp";


const randInRange=(from=0,to=1)=>from+Math.random()*(to-from);

function Ball({radius=2,speed=1,angle,cx,cy}){
    const ball = useRef();

    useEffect(()=>{
        ball.current.style.setProperty("--angle", angle+"deg");
        ball.current.style.setProperty("--speed", speed);
        ball.current.style.setProperty("--hue", Math.random()*360+"deg");
    });
    
    return <circle className="radial confetti" ref={ball} cx={cx} cy={cy} r={radius}/>;
}

function RadialParticleEmitter({width,height,cx,cy}){
    const list = [];
    for(let i=0;i<50;i++){
        list.push(<Ball key={i} angle={randInRange(-270,-90)} cx={cx} cy={cy} speed={randInRange(5,20)} radius={randInRange(2,5)}/>);
    }
    return <svg width={width} height={height}>{list}</svg>
}
const SVGS = {};
export function LinearParticleEmitter({id,width,height,miny,maxy,stopped}){
    if(!SVGS[id]){
        const list = [];
        for(let i=0;i<250;i++){
            let speed = randInRange(10,15);
            list.push(<Ball key={i} angle={-180} cx={randInRange(0,width)} cy={speed*randInRange(miny,maxy)} speed={speed} radius={randInRange(2,5)}/>);
        }
        SVGS[id] = <svg width={width} height={height}>{list}</svg>;
    }
    return  <div className={"particle-div"+(stopped?" stopped":"")} style={{display:"flex",justifyContent:"center"}}>
                {SVGS[id]}
            </div>
}


export default function AnimationOverlay(){
    let svgRef = useRef();
    const animationStates = UserAppClass.instance.getAnimationStates();
    return <div className="animation unresponsive window">
        <div className="bottom-confetti">
            <LinearParticleEmitter stopped={!animationStates.bottomConfetti.playing} ref={svgRef} id={1} width={innerWidth} height={innerHeight*2} miny={-50} maxy={0}/>
        </div>
    </div>
}