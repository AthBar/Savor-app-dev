import { useNavigate } from "react-router";
import Topbar from "./Topbar.jsx";
import React, { useEffect, useRef, useState } from "react";
import OrderPreview from "./OrderPreview.jsx";
import UserApp, { currency } from "./MainApp.jsx";
import IngredientSelector from "./IngredientSelector.jsx";

function OrderItem({self,entry}){
    return (
        <div className="menu-item">
            <div className="item-title">
                <div>
                    {self.title}
                    <span style={{fontSize:"0.75em"}}>{entry.count>1?` (x${entry.count})`:""}</span>
                </div>
                <div>
                    <button className="info" onClick={()=>CartPage.instance.edit(entry)}>i</button>
                    <button className="remove" onClick={()=>UserApp.instance.removeFromCart(entry)}>-</button>
                </div>
            </div>
            <hr/>
            <div className="item-details">
                <div className="item-ingredients">{
                    self.ingredients.join(", ")
                }</div>
                <div className="price-tag">
                    {currency(UserApp.instance.calculatePrice(entry))}
                </div>
            </div>
        </div>
    )
}
function OrderList(){
    const cart = UserApp.instance.cart;
    const menu = UserApp.instance.menu;

    return (
        <div className="item-list">{
            cart.length<=0?
            "Άδειο καλάθι":
            cart.map((i,n)=>
                <OrderItem key={n} self={{...menu[i.code],...i}} entry={i}/>
            )
        }</div>
    )
}

class CartEditWindowClass extends React.Component{
    static instance;
    #text;
    constructor(props){
        super(props);
        CartEditWindowClass.instance = this;

        this.state = {open:false};
    }
    static open(editing){
        if(CartEditWindowClass.instance)
        CartEditWindowClass.instance.setState({open:true,editing});
    }
    saveAndClose(){
        if(!this.#text)delete this.state.editing.info;
        else this.state.editing.info = {comments:this.#text};

        this.#text = undefined;
        delete this.state.editing;
        this.setState({open:false});
    }
    render(){
        if(!this.state.open||!this.state.editing)return;
        let editing = this.state.editing;

        this.#text = editing.info?(editing.info.comments||""):"";
        return <div className="window cart">
            <div className={"cart contents enabled"}>
                <div style={{fontSize:"1.5em",padding:"15px"}}>
                    <div>{editing.title}</div>
                    <div>
                        {currency(editing.price)}
                    </div>
                </div>
                <div>
                    <div style={{backgroundColor:"rgba(0,0,0,5%)",padding:"15px",border:"2px groove #ddd",borderLeft:"none",borderRight:"none"}}>
                        <div style={{textAlign:"left",marginBottom:"5px"}}>Σχόλια:</div>
                        <textarea defaultValue={this.#text} onChange={e=>this.#text=e.target.value} style={{width:"100%",boxShadow:"var(--soft-shadow)",border:"none",padding:"12px",resize:"none",outline:"none"}} />
                    </div>
                    <div className="buttons" style={{padding:"15px"}}>
                        <button className="ok" onClick={()=>this.saveAndClose()}>OK</button>
                        <button className="cancel" onClick={()=>this.setState({open:false})}>Άκυρο</button>
                    </div>
                </div>
            </div>
        </div>;
    }
}

export default class CartPage extends React.Component{
    static instance;
    #editingEntry;
    constructor(props){
        super(props);
        this.state = {};
        CartPage.instance = this;
    }
    edit(entry){
        this.#editingEntry = entry;
        IngredientSelector.instance.open(entry);
    }
    editFinished(e){
        const v = this.#editingEntry;
        v.count = e.count;
        v.ingredients = e.ingredients;
        v.info = e.info;
        this.forceUpdate();
        console.log(e)
        return this.#editingEntry = false;
    }
    render(){
        const cart = UserApp.instance.cart;

        return (
            <div className="content cart-page">
                <Topbar previous="../menu"/>
                <CartEditWindowClass/>
                <div className="cart-grid">
                    <div className="order-title" style={{borderBottom: "1px solid black"}}>Καλάθι</div>
                    <OrderList/>
                    
                    <OrderPreview cart={cart} cartMode/>
                    <IngredientSelector buttonText="Αποθήκευση" onSubmit={e=>this.editFinished(e)}/>
                </div>
            </div>
        )
    }
}