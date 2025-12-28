import React from "react";
import TestWindow from "./Window";
import OwnerApp from "./OwnerApp";
import OwnerApp2 from "./App2";

export default class SelectedTableView extends React.Component{
    constructor(props){
        super(props);
        this.state = {table:props.table||null}
        OwnerApp.instance.on("table-selected",e=>this.table=e)
    }
    set table(v){
        this.setState({table:v})
    }
    render(){
        const sess = OwnerApp2.instance.placeSession;
        const tables = sess.tables;
        if(tables[this.state.table]){
            return <div style={{wordBreak:"break-all"}}>{JSON.stringify(tables[this.state.table].map(s=>s.export()))}</div>;
        }
        else return <div></div>
    }
}