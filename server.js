import 'dotenv/config';
import path from "path";
import express from "express";
import { createServer } from "vite";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));


const app = express();

function matchURL(url,res,file,...search){
    const a = "/"+search.join(",");
    if(url==a||url.startsWith(a+"/")){
        res.sendFile(path.join(__dirname, file))
        return true;
    };
}

app.use((req,res,next)=>{
    return (
        matchURL(req.url,res,'dashboard-app.html',"dashboard")||
        matchURL(req.url,res,'user-app.html',"store")||
        matchURL(req.url,res,'place-app.html',"place")||
        matchURL(req.url,res,'watch-app.html',"watch")||
        next()
    );
});

const vite = await createServer({
    server:{middlewareMode:true},
    root:__dirname
});

app.use(vite.middlewares);

const timeStr = timeNow=>`[${timeNow.getHours()}:${timeNow.getMinutes()}.${timeNow.getSeconds()}]`;
const PORT = process.env.APP_PORT || 7287;
const httpServer = app.listen(PORT,e=>{
    if(e)return console.log("Encountered error on server startup: ",e);
    console.log(timeStr(new Date()) + " - Server running on port "+PORT);
});