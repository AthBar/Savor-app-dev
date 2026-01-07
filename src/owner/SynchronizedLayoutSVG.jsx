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
            let black = sess.connects>0?"#555":"gray";
            let startColor = black;
            let endColor=black;

            //If connected but no orders, make a blinking black
            if(sess.connects>0&&!sess.isActive)startColor = "gray";

            if(lastOrder){
                //If rejected, make a static red
                if(lastOrder.rejected){
                    console.log("Rej");
                    startColor = endColor = "#600";
                }
                //If not yet accepted, make a blinking red
                else if(!lastOrder.accepted){
                    endColor = "#a00";
                }
                //If accepted but not delivered, make a static yellow
                else if(!lastOrder.delivered){
                    startColor = endColor = "#080";
                }
                if(lastOrder.paid){
                    startColor = endColor = "#880";
                }
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