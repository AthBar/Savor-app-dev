import React from "react";
import { useNavigate } from "react-router";
import UserApp, { currency } from "./MainApp";

export function MyOrderSendButton({inCart,cart}){
    const goToPage = useNavigate();
    const disabled = cart.length<=0||UserApp.instance.hasActiveOrder;
    const next = disabled?"/store/menu":(inCart?"/store":"/store/cart");
    const text = disabled?"Πίσω":(inCart?`Αποστολή στο τραπέζι ${UserApp.instance.destination.table}`:"Συνέχεια");

    function onClick(){
        goToPage(next);
        if(disabled)return;
        if(inCart)UserApp.instance.sendOrder();
        if(!inCart)return goToPage("/store/cart");
    }

    return <button className={"green-wide-button"+(disabled?" disabled":"")} onClick={onClick}>
                {text}
            </button>
}

export default class OrderPreview extends React.Component{
    render(){
        const cart = Object.values(UserApp.instance.tableSession.cart);
        if(!this.props.cartMode&&cart.length<=0)return null;

        let total = 0;
        for(let i of cart)total+=UserApp.instance.calculatePrice(i);

        const text = this.props.cartMode?"Σύνολο":cart.length+" αντικείμενα";
        return <div className="order-sender">
            <div className="item-details">
                <div className="cart-total">{text}</div>
                <div className="price-tag">{currency(total)}</div>
            </div>
            <MyOrderSendButton inCart={this.props.cartMode} cart={cart}/>
        </div>
    }
}