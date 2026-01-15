import LayoutManager from "./LayoutManager.js";

export default class SynchronizedLayoutManager extends LayoutManager{
    placeSession;
    constructor(placeId,placeSession){
        super(placeId,false);
        this.placeSession = placeSession;
        placeSession.on("change",()=>this.#syncTableBlinks());
        this.on("initialized",()=>this.#syncTableBlinks())
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

            if(!lastOrder)return;
            else if(lastOrder.running){
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
                
            }
            else if(lastOrder.paid){
                startColor = endColor = "#880";
            }
            this.tableColor(table,startColor,endColor);
        }
        window.requestAnimationFrame(()=>this.change());
    }
}