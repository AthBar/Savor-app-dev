import { useEffect, useState } from "react";
import { currency } from "./functions";

export function PriceInput({price,onChange,onBlur,onValueChanged,...props}){
    const onchange = e=>{
        if(onChange)onChange(e);
        setValue(e.target.value)
    }
    const onBlurNumber = e=>{
        const numValue = Math.max(parseFloat(e.target.value.replaceAll(",",".").trim()),0);
        setValue(numValue.toFixed(2));
        if(onValueChanged)onValueChanged(Math.round(numValue*100));
        if(onBlur)onBlur(e);
    }
    const onKeyDown = e=>{
        if(e.key=="Enter")e.target.blur();
    }
    const unscroll = e=>{
        if(document.activeElement!=e.target)return;
        e.target.blur();
        e.stopPropagation();
        requestAnimationFrame(()=>e.target.focus())
    }
    const beforeInput = e=>{
        if(!/^[0-9]*([.,][0-9]*)?$/.test(e.data))e.preventDefault();
    }
    const targetValue = currency(price).slice(0,-1);
    const [value,setValue] = useState(targetValue);

    useEffect(()=>setValue(targetValue),[price]);

    return <input {...props} type="text" inputMode="decimal" pattern="[0-9]*[.,]?[0-9]*" onBeforeInput={beforeInput} onChange={onchange} onBlur={onBlurNumber} onKeyDown={onKeyDown} onWheelCapture={unscroll} value={value}/>
}