class FullscreenService{
    constructor(){

    }
    static onclick(e){
        document.querySelector("#root").requestFullscreen();
    }
}
window.addEventListener("click",e=>FullscreenService.onclick(e))