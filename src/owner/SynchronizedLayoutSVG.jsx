import React from "react";
import LayoutSVG from "./LayoutSVG";
import { ListenerClientHandler } from "../common/ListenerSocket";

export default class SynchronizedLayoutSVG extends LayoutSVG{
    placeSession;#onchange=()=>window.requestAnimationFrame(()=>this.#syncTableBlinks());
    constructor(props){
        super(props);
        this.placeSession = props.placeSession;
        this.placeSession.on("change",this.#onchange);
    }
    tableColor(table,startColor,endColor=startColor){
        return this.setBlink(table,startColor,endColor);
    }
    #syncTableBlinks(){
        const list = this.placeSession.tables;
        for(let table of Object.keys(list)){
            const sess = list[table].at(-1);
            const lastOrder = sess.orders.at(-1);
            const black = sess.connects>0?"#222":"gray";
            let startColor = black, endColor=black;

            if(lastOrder){
                if(lastOrder.rejected){
                    startColor = endColor = "#800";
                }
                if(!lastOrder.accepted){
                    endColor = "#a00";
                }
                else if(!lastOrder.delivered){
                    this.tableColor(table,"#dd0");
                    continue;
                }
            }
            if(sess.connects>0){
                this.tableColor(table,"gray");
            }
            this.tableColor(table,startColor,endColor);
        }
        this.forceUpdate();
    }
    componentDidMount(){
        LayoutSVG.prototype.componentDidMount.call(this);
        this.#onchange();
        this.on("layout-parsed",()=>this.#onchange(),true)
    }
    #syncBlinksFor(table){
        const sess = this.placeSession.tables[table].at(-1);
        const lastOrder = sess.orders.at(-1);
        const black = sess.connects>0?"black":"gray";
        if(lastOrder){
            if(lastOrder.rejected){
                this.tableColor(table,black);
                return;
            }
            if(!lastOrder.accepted){
                this.tableColor(table,black,"#a00");
                return;
            }
            if(!lastOrder.delivered){
                this.tableColor(table,"#dd0");
                return;
            }
        }
        this.tableColor(table,black)
    }
}
window.SyncLayoutSVG = SynchronizedLayoutSVG;