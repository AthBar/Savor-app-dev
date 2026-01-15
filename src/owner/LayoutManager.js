import { API } from "../common/API.js";
import { Unit } from "../common/VirtualSessions.js";

export default class LayoutManager extends Unit{
    /**
     * @type {LayoutManager}
     */
    static instance;
    static cache={};
    placeId;
    layout = {areas:[],tables:{}};
    blinks={};
    refs={};
    selectedTable;
    viewOnly;
    isLoaded=false;
    
    constructor(placeId,viewOnly=true){
        super("LayoutSVG");
        this.placeId = placeId;
        this.viewOnly = viewOnly;
        this.selectedTable = undefined;

        
        LayoutManager.instance = this;
    }
    selectTable(id){
        if(this.selectedTable===id)return;
        this.selectedTable = id;
        this.change();
    }
    async initialize(){
        return this.#initialize().then(r=>{
            this.isLoaded = true;
            this.do("initialized");
            this.change();
        })
    }
    async #initialize(){
        if(!LayoutManager.cache[this.placeId])
            LayoutManager.cache[this.placeId] = API(`/place/layout/${this.placeId}`).catch(e=>console.log("Error in layout:",e));

        return LayoutManager.cache[this.placeId].then(r=>{
            if(!Array.isArray(r.areas)||(!r.tables instanceof Object)){
                this.layout=false;
                return;
            }
            this.layout = r;
            
            const defaultColor = "gray";
            for (let t of Object.keys(r.tables)){
                r.tables[t].id = t;
                if(!this.blinks[t])this.blinks[t] = {from:defaultColor,to:defaultColor};
            }
            this.layout = r;
            this.selectedTable = null;
            this.do("layout-loaded");
        });
    }
    setBlink(table,from,to){
        this.blinks[table] = {from,to};
        this.change();
    }
}