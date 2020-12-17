import { pdfjs } from "react-pdf";

class PDFLoader {
    constructor(context, file) {
        this.context = context;
        this.file = file;
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    }

    onLoad(e) {
        pdfjs.getDocument(new Uint8Array(e.target.result)).promise.then(this.getDocument.bind(this), this.getDocumentFailed.bind(this));
    }

    getDocument(pdf) {
        var p = pdf.numPages;
        do {
            let page_uuid = this.context.addWaiting();
            pdf.getPage(p).then(this.getPage.bind(this, page_uuid), this.getPageFailed.bind(this, page_uuid));
        } while (p-- > 1);
    }

    getPage(page_uuid, page) {
        let viewport = page.getViewport({ scale: 300/72 }); //DPI in pdfjs is 72, this scales to 300dpi
        let canvas = document.createElement("canvas");
        document.body.appendChild(canvas);
        canvas.setAttribute("style", "display: none;");
        let context = canvas.getContext("2d");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        page.render({ canvasContext: context, viewport: viewport }).promise.then(this.rendered.bind(this, canvas, page_uuid, page), this.renderedFailed.bind(page_uuid));
    }

    rendered(canvas, page_uuid, page) {
        let img = document.createElement("img");
        img.setAttribute("src", canvas.toDataURL("image/jpeg"));
        img.setAttribute("width", canvas.width);
        img.setAttribute("height", canvas.height);
        document.body.removeChild(canvas);
        this.context.addCard(img, this.file.name + " page " + page.pageNumber, page_uuid);
        this.context.removeWaiting(page_uuid);
    }

    getDocumentFailed(message){
        console.log("pdfjs.getDocument failed", message);
    }

    getPageFailed(page_uuid, message) {
        this.context.removeWaiting(page_uuid);
        console.log("pdfjs.document.getPage failed", message);
    }

    renderedFailed(page_uuid, message) {
        this.context.removeWaiting(page_uuid);
        console.log("pdfjs.document.page.render failed", message);
    }
}

export default function loadPDF(context, file) {
    let loader = new PDFLoader(context, file);
    return loader.onLoad.bind(loader);
}
