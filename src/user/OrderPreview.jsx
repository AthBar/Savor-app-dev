import React from "react";
import { useNavigate } from "react-router";
import UserApp, { currency, useApp } from "./MainApp";

export function MyOrderSendButton({inCart,cart}){
    const {hasActiveOrder,tableSession} = useApp();
    const goToPage = useNavigate();
    const disabled = cart.length<=0||hasActiveOrder();
    const next = disabled?"/store/menu":(inCart?"/store":"/store/cart");
    const text = disabled?"Πίσω":(inCart?`Αποστολή στο τραπέζι ${tableSession.table}`:"Συνέχεια");

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

export default function OrderPreview({cartMode}){
    const {tableSession,calculatePrice,currency} = useApp();
    const cart = Object.values(tableSession.cart);
    if(!cartMode&&cart.length<=0)return null;

    let total = 0;
    for(let i of cart)total+=calculatePrice(i);

    const text = cartMode?"Σύνολο":cart.length+" αντικείμενα";
    return <div className="order-sender">
        <div className="item-details">
            <div className="cart-total">{text}</div>
            <div className="price-tag">{currency(total)}</div>
        </div>
        <MyOrderSendButton inCart={cartMode} cart={cart}/>
    </div>
}