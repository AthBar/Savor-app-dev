import MenuComponent from "./Menu";
import UserApp, { currency } from "./MainApp";
import React, { createRef } from "react";
import { useNavigate } from "react-router";
import { MyOrderSendButton } from "./OrderPreview";

class Banner extends React.Component{
    #pic;
    #f=()=>this.setState({y:pageYOffset});
    constructor(props){
        super(props);
        this.state = {y:0,loaded:false};
        this.#pic = <img src={props.src} height={props.height} width={props.width} ref={createRef()} onLoad={()=>this.setState({loaded:true})} />
        addEventListener("scroll",this.#f);
    }
    componentWillUnmount(){
        removeEventListener("scroll",this.#f);
    }
    render(){
        return  <div className="banner-container" style={{top: -this.state.y/4 + "px"}} >
                    {this.#pic}
                </div>
    }
}
const BackSVG = ()=><svg aria-hidden="true" focusable="false" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 512" width="50px" height="50px" style={{justifySelf:"left",marginLeft:"25px"}}><path fill="currentColor" d="M4.2 247.5L151 99.5c4.7-4.7 12.3-4.7 17 0l19.8 19.8c4.7 4.7 4.7 12.3 0 17L69.3 256l118.5 119.7c4.7 4.7 4.7 12.3 0 17L168 412.5c-4.7 4.7-12.3 4.7-17 0L4.2 264.5c-4.7-4.7-4.7-12.3 0-17z"></path></svg>;

function Topbar({previous,showCart,active}){
    const goToPage = useNavigate()
    let destination = UserApp.instance.destination;
    let placeName = UserApp.instance.place.name;
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

function HeaderForAll({Y}){
    const switchY = 200;
    const goToPage = useNavigate();
    const placeDirectory = UserApp.instance.place.id||"_";
    return <header>
                {Y>=switchY?
                    <Topbar previous={"/store"} showCart={!UserApp.instance.hasActiveOrder} active/>:

                    <div className="topbar2" style={{
                        backgroundColor: `rgba(255,255,255,${Y/switchY})`,
                        top: -Math.max(0,Y-switchY),
                        visibility: Y<=switchY?"visible":"hidden"
                    }}>
                        <div className="topbar-around" onClick={()=>goToPage("../")}>
                            <BackSVG/>
                        </div>
                        <div className="store-name-top">
                            <div></div>
                        </div>
                        <div className="topbar-around logo">
                            <img src="/images/logo.svg"/>
                        </div>
                    </div>
                }
                <Banner src={`/places/${placeDirectory}/images/banner.png`}/>
            </header>
}

function OrderPreview({cart}){
    let total = 0;
    const entries = Object.values(cart);
    const count = entries.length;
    for(let i of entries)total+=UserApp.instance.calculatePrice(i);

    return <div className={"order-sender"+(count<=0?" empty":"")}>
        <div className="item-details">
            <div className="cart-total">{count==1?"1 αντικείμενο":(count+" αντικείμενα")}</div>
            <div className="price-tag">{currency(total)}</div>
        </div>
        <div className="gotocart-buttons">
            <button className="del" onClick={()=>UserApp.instance.emptyCart()}>
                <img src="/delete.svg"/>
            </button>
            <MyOrderSendButton cart={cart}/>
        </div>
    </div>
}

let Y = 0;
export default class MainPage extends React.Component{
    #f=()=>{Y=pageYOffset;this.forceUpdate()};
    constructor(props){
        super(props);
        addEventListener("scroll",this.#f);
        UserApp.instance.tableSession.on("change",()=>this.forceUpdate())
    }
    componentWillUnmount(){
        removeEventListener("scroll",this.#f);
    }
    componentDidMount(){
        scrollTo(0,Y);
        UserApp.menuPromise.then(r=>this.forceUpdate())
    }
    render(){
        return (
            <div className="content default">
                <HeaderForAll Y={Y}/>
                <MenuComponent menu={UserApp.instance.menu}/>
                <OrderPreview cart={UserApp.instance.tableSession.cart}/>
            </div>
        );
    }
}