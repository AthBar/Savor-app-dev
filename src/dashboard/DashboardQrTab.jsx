import React, { createRef } from "react";
import DashboardTab from "./DashboardTab";
import Dashboard from "./Dashboard";
import { API } from "../common/functions";

class QRComponent extends React.Component{
    static module;
    #image;
    constructor(props){
        super(props);
        this.state = {
            text: props.text,
            width: props.width,
            height: props.height
        };
        this.#image = <div>Loading...</div>;
    }
    componentDidMount(){
        if(!QRComponent.module)QRComponent.module = import('https://cdn.jsdelivr.net/npm/@cheprasov/qrcode/+esm').then(r=>r.default);
        QRComponent.module.then(r=>{
            const data = new r.QRCodeSVG(this.state.text).toDataURL();
            this.#image = <img src={data} width={this.state.width} height={this.state.height}/>
            this.forceUpdate();
        });
    }
    render(){
        if(!QRComponent.module)return <div>Loading...</div>;
        return this.#image;
    }
}

export default class DashboardQrTab extends DashboardTab{
    constructor(props){
        super(props);
        this.state={tables:undefined};
        if(!Dashboard.tableListPromise){
            Dashboard.tableListPromise = 
            API(`/dashboard/${this.place.id}/table-list`);
        }
        Dashboard.tableListPromise.then(r=>{
            const data ={};
            for(let i of r.data)data[i.internal_id]=i.qr_id;
            this.setState({tables:data})
        });
    }
    idToURL(id) {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-";
        let num = id; // parse as BigInt so large values are safe

        if (num === 0) return "A"; // special case

        let base64 = "";
        while (num > 0) {
            const val = Number(num & 63); // take last 6 bits
            base64 = chars[val] + base64;
            num >>= 6; // shift right 6 bits
        }

        return `http://${location.hostname}:7288/o/${base64}`;
    }
    render(){
        if(!this.state.tables)return <div>No tables</div>;
        return <div className="qr-tab">
            <div>
                <h1>Οι κωδικοί QR ανα τραπέζι σας:<a onClick={()=>print()}>Εκτύπωση</a></h1>
                <hr/>
            </div>
            <div className="qr-list-container">
                {Object.keys(this.state.tables).map((r,i)=>
                    <div className="qr-wrapper" key={i}>
                        <h2>{r}</h2>
                        <QRComponent text={this.idToURL(this.state.tables[r])} width="170"/>
                    </div>
                )}
            </div>
        </div>;
    }
}