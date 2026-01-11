import React from "react";

export default class MyEventTarget{
    #evs = {};
    on(type,f,once){
        const l = this.#evs[type];

        //Check if same listener function already exists, if it does, don't add a new one, but set that listener's once condition to the new one
        if(l instanceof Set)for(let i of l)if(i.f==f)return i.once=once;

        //Store the once argument with the listener function
        f={f,once};

        //Add the listener in the object
        if(l)l.add(f);
        else this.#evs[type] = new Set([f]);
    }
    off(type,f){
        if(this.#evs[type]){
            for(let i of this.#evs[type]){
                if(i.f==f)return this.#evs[type].delete(i);
            }
        }
    }
    do(type,...args){
        if(!this.#evs[type])return;
        for(let f of this.#evs[type]){
            try{
                f.f(...args);
            }
            catch(e){
                console.error("In event listener: ",e)
            }
            //If listener has one time run enabled, remove the listener
            if(f.once)this.#evs[type].delete(f);
        }
    }
}

export class EventComponent extends React.Component{
    #target=new MyEventTarget();
    do(type,...args){return this.#target.do(type,...args)}
    on(type,f,once){return this.#target.on(type,f,once)}
    off(type,f){return this.#target.off(type,f)}
}