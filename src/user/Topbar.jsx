import { useNavigate } from "react-router";
import UserApp from "./MainApp";

function BackSVG({size=50}){
    return (<svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" width={size+"px"} height={size+"px"}><path fill="currentColor" d="M4.2 247.5L151 99.5c4.7-4.7 12.3-4.7 17 0l19.8 19.8c4.7 4.7 4.7 12.3 0 17L69.3 256l118.5 119.7c4.7 4.7 4.7 12.3 0 17L168 412.5c-4.7 4.7-12.3 4.7-17 0L4.2 264.5c-4.7-4.7-4.7-12.3 0-17z"></path></svg>);
}

export default function Topbar({previous,showCart,active}){
    let nav = useNavigate();
    let destination = UserApp.instance.destination;
    let placeName = UserApp.instance.placeName;
    const goToPage = p=>{
        nav(p);
        localStorage.setItem("_savr__last",location.pathname);
    }
    return (
        <div className={"topbar"+(active?" active":"")} style={{top:"0px"}}>
  {previous?<div className="back" onClick={()=>goToPage(previous)}>
                <BackSVG/>
            </div>:<div/>}
            <div className="middle">
                <div className="title">
                    {placeName}
                </div>
                {destination?<div className="destination-note">Η παραγγελία θα έρθει στο τραπέζι {destination.table}</div>:null}
            </div>
  {showCart?<div className="cart" onClick={()=>goToPage("../cart")}>
                <img src="/images/cart-empty.png"></img>
            </div>:null}
        </div>
    );
}