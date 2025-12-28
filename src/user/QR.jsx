import { useEffect, useRef } from "react";

export default function QRPage(){
    const canvasRef = useRef(null);

    useEffect(()=>{
        const cnv = canvasRef.current;
        const ctx = cnv.getContext("2d");
        document.body.style.margin = "0";
        document.body.style.background = "#eee"
        ctx.imageSmoothingEnabled = false;

        API("/qr/full").then(r=>{
            const [w,h] = [innerWidth,innerHeight-4];
            const [iw,ih] = [200,200];
            const perRow = Math.floor(w/iw);
            let y = 0;
            
            cnv.width = w;
            cnv.height = h;
            ctx.fillStyle = "white";
            for(let x in r.data){
                if(x-y*perRow>=perRow){
                    ctx.fillRect(x*iw,y*ih,iw,ih);
                    y++;
                }
                let img = new Image();
                let i = r.data[x];
                let iy = y;
                img.src = i;
                img.addEventListener("load",()=>ctx.drawImage(img,(x-iy*perRow)*iw,iy*ih,iw,ih));
            }
        })
    })

    return <canvas ref={canvasRef}/>;
}