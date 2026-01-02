import { useNavigate } from "react-router";
import React, { useEffect, useRef, useState } from "react";
import UserApp, { currency } from "./MainApp";
import { PriceInput } from "../common/Form";

function TablePageHeader(){
    return <div className="table-topbar">{UserApp.instance.placeName}</div>
}
class PaymentWindow extends React.Component{
    #payPart;
    constructor(props){
        super(props);
        this.state = {total:UserApp.instance.balance,amount:1};
        UserApp.instance.tableSession.on("change",()=>{
            const total = UserApp.instance.balance;
            this.setState({
                total,
                amount:Math.max(Math.min(this.state.amount,total),0)
            })
        }); 
    }
    render(){
        const Pay = ()=>{if(this.state.total<=0)return <hr/>
            return this.#payPart;
        }
        return <div className="ask-to-pay">
                    <h1 style={{textAlign:"center"}}>Λογαριασμός</h1>
                    <hr/>
                    <div>Υπόλοιπο: {currency(this.state.total)}</div>
                    <div>
                        <div>Πληρωμή:</div>
                        <div style={{display:"flex"}}>
                            <input name="pay-amount" type="range" min={1} max={this.state.total} value={this.state.amount} onChange={e=>this.setState({amount:e.target.value})} disabled={this.state.total<=0}/>
                            <PriceInput onValueChanged={amount=>this.setState({amount})} price={this.state.amount} disabled={this.state.total<=0}/>
                        </div>
                        <hr/>
                    </div>
                    <div className="yes-no-container">
                        <button className="yes" onClick={()=>UserApp.instance.pay(this.state.amount)}>Ναι</button>
                        <button className="no" onClick={()=>UserApp.instance.popup(false)}>Όχι</button>
                    </div>
                </div>
    }
}

export class OrderHistory extends React.Component{
    #f=()=>this.forceUpdate();
    constructor(props){
        super(props);
        this.state = {menu:undefined};
        
        
        UserApp.menuPromise.then(l=>{
            const menu = {};
            for(let i of l){
                i = {...i};
                menu[i.code] = i;
                delete i.code;
            }
            this.setState({menu});
        });
    }
    componentDidMount(){
        this.#sync();
        UserApp.instance.on("session-refresh",prev=>this.#sync(prev));
    }
    #sync(prev){
        if(prev)prev.off("change",this.#f);
        UserApp.instance.tableSession.on("change",this.#f);
    }
    CreateOrder(data,key){
        return <div className="history-group" key={key}>
                    <div className="history-text">Παραγγελία</div>{Object.values(data.cart).map(
                (o,i)=> <div className="history-unit" key={i}>
                        <div className="history-joiner"/>
                        <div className="history-text">{o.count>1?o.count+"x ":null}{this.state.menu[o.code].title}</div>
                    </div>
                )}
                </div>
    }
    OrderHistoryUnit(data,key){
        const arr = [this.CreateOrder(data,key)];
        if(data.cancelled)arr.push(<div className="history-text" key={key+"-canc"}>Ακύρωση παραγγελίας (από προσωπικό)</div>)
        if(data.accepted)arr.push(<div className="history-text" key={key+"-acc"}>Αποδοχή παραγγελίας</div>)
        if(data.rejected)arr.push(<div className="history-text" key={key+"-rej"}>Απόρριψη παραγγελίας</div>)
        if(data.delivered)arr.push(<div className="history-text" key={key+"-del"}>Παράδοση παραγγελίας</div>)
        return arr;
    }
    render(){
        if(!this.state.menu)return <div className="history"/>
        return <div className="history">
                    <div className="history-title" style={{textAlign:"center"}}>Σύνολο: {currency(UserApp.instance.total)}</div>
                    <div className="history-contents">
                        {UserApp.instance.tableSession.orders.map((u,i)=>this.OrderHistoryUnit(u,i))}
                    </div>
                </div>
    }
}

function Buttons(){
    const nav = useNavigate();
    const active = UserApp.instance.hasActiveOrder
    return  <div className="options">
                <div className={"option"+(active?"":" animating")} onClick={()=>nav("/store/menu")}>
                    {active?"Περιήγηση στον κατάλογο":"Παραγγελία"}
                </div>
                {UserApp.instance.total<=0&&UserApp.instance.tableSession.orders.length>0?
                <div className="option animating" onClick={()=>UserApp.instance.leave()}>
                    Αποχώρηση
                </div>
                :null}
            </div>
}

export default class TablePage extends React.Component{
    #f=()=>this.forceUpdate();
    constructor(props){
        super(props);
        this.state = {
            history:[],
            askToPayActive:false
        };

        UserApp.instance.tableSession.on("change",this.#f);
    }
    componentWillUnmount(){
        UserApp.instance.tableSession.off("change",this.#f);
    }
    render(){
        const openPaymentPopup = v=>UserApp.instance.popup(<PaymentWindow/>);

        let destination = UserApp.instance.destination;
        return (
            <div className="content table-page">
                <TablePageHeader/>
                <div className="table-options">
                    <div>
                    <h1 style={{textAlign:"center"}}>Τραπέζι {destination.table}</h1>
                    </div>
                    <OrderHistory/>
                    <Buttons openPaymentPopup={openPaymentPopup}/>
                </div>
            </div>
        )
    }
}