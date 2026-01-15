import MenuComponent from "./Menu";
import { currency, useApp } from "./MainApp";
import { useEffect, useState, useSyncExternalStore } from "react";
import { useNavigate } from "react-router";
import UserApp from "./UserApp";

function Banner(props){
    const [y,setY] = useState(pageYOffset);
    const [loaded,setLoaded] = useState(false);
    const f=()=>setY(pageYOffset);

    useEffect(()=>{
        addEventListener("scroll",f);
        return ()=>removeEventListener("scroll",f);
    },[]);
    
    return  <div className="banner-container" style={{top: -y/4 + "px"}} >
                <img {...props} onLoad={()=>setLoaded(true)} />
            </div>;
}
const BackSVG = ()=><svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" width="50px" height="50px"><path fill="currentColor" d="M4.2 247.5L151 99.5c4.7-4.7 12.3-4.7 17 0l19.8 19.8c4.7 4.7 4.7 12.3 0 17L69.3 256l118.5 119.7c4.7 4.7 4.7 12.3 0 17L168 412.5c-4.7 4.7-12.3 4.7-17 0L4.2 264.5c-4.7-4.7-4.7-12.3 0-17z"></path></svg>;

function Topbar({previous,showCart,active}){
    const {app} = useApp();
    const destination = app.destination;
    const goToPage = useNavigate();

    return (
        <div className={"topbar"+(active?" active":"")} style={{top:"0px"}}>
  {previous?<div className="back" onClick={()=>goToPage(previous)}>
                <BackSVG/>
            </div>:<div/>}
            <div className="middle">
                <div className="title">
                    {app.place.name}
                </div>
                {destination?<div className="destination-note">{
                    app.canOrder?
                    `Η παραγγελία θα έρθει στο τραπέζι ${destination.table}`:
                    app.place.status.closed?
                    "Η επιχείρηση βρίσκεται σε διαδικασία κλεισίματος":
                    "Δεν μπορείτε να παραγγείλετε αυτή την στιγμή"
                }</div>:null}
            </div>
  {showCart?<div className="cart" onClick={()=>goToPage("../cart")}>
                <img src="/images/cart-empty.png"></img>
            </div>:null}
        </div>
    );
}

function HeaderForAll({Y}){
    const {app} = useApp();
    const switchY = 200;
    const nav = useNavigate();
    const placeDirectory = app.place.id||"_";
    return <header>
                {Y>=switchY?
                    <Topbar previous={"/store"} showCart={app.canOrder} active/>:

                    <div className="topbar2" style={{
                        backgroundColor: `rgba(255,255,255,${Y/switchY})`,
                        top: -Math.max(0,Y-switchY),
                        visibility: Y<=switchY?"visible":"hidden"
                    }}>
                        <div className="topbar-around" onClick={()=>nav("../")} style={{paddingLeft:"25px"}}>
                            <BackSVG/>
                        </div>
                        <div className="store-name-top">
                            <div></div>
                        </div>
                        <div className="topbar-around logo">
                            <img src="/images/logo.png"/>
                        </div>
                    </div>
                }
                <Banner src={`/places/${placeDirectory}/images/banner.png`}/>
            </header>
}

function OrderPreview({cart}){
    const {app} = useApp();
    const nav = useNavigate();

    let total = 0;
    const entries = Object.values(cart);
    const count = entries.length;
    for(let i of entries)total+=UserApp.instance.calculatePrice(i);

    //                                  This class makes it pop up
    return <div className={"order-sender"+(count<=0?" empty":"")}>
        <div className="item-details">
            <div className="cart-total">
                {count==1?"1 αντικείμενο":(count+" αντικείμενα")}
            </div>
            <div className="price-tag">{currency(total)}</div>
        </div>
        <div className="gotocart-buttons">
            <button className="del" onClick={()=>app.emptyCart()}>
                <img src="/delete.svg"/>
            </button>
            <button className="green-wide-button" onClick={()=>nav("../cart")}>
                Συνέχεια
            </button>
        </div>
    </div>
}

let Y = 0;
export default function MainPage(){
    const [y,setY] = useState(Y);
    const f=()=>setY(Y=pageYOffset);
    const {app} = useApp();

    useEffect(()=>{
        scrollTo(0,Y);
        addEventListener("scroll",f);
        return ()=>removeEventListener("scroll",f);
    },[]);

    useSyncExternalStore(app.subscription,()=>app.cart);

    return  <div className="content default">
                <HeaderForAll Y={y}/>
                <MenuComponent/>
                <OrderPreview cart={app.cart}/>
            </div>;
}