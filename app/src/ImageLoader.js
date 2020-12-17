class ImageLoader {
    constructor(context, file) {
        this.context = context;
        this.file = file;
        this.uuid = null;
    }

    onLoad(e){
        this.uuid = this.context.addWaiting();
        var image = new Image();
        image.title = this.file.name;
        image.onload = this.imageOnLoad.bind(this);
        image.src = e.target.result;
    }

    imageOnLoad(e){
        this.context.addCard(e.target, e.target.title, this.uuid);
        this.context.removeWaiting(this.uuid);
    }
}

export default function loadImage(context, file){
    let loader = new ImageLoader(context, file);
    return loader.onLoad.bind(loader);
};