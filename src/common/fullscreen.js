class FullscreenService{
    constructor(){

    }
    static onclick(e){console.log(e)
        document.querySelector("#root").requestFullscreen();
    }
}
window.addEventListener("click",e=>FullscreenService.onclick(e))