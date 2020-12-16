import React from "react";
import "./App.css";
import Canvas from "./Canvas";

import { pdfjs } from "react-pdf";

class App extends React.Component {
    constructor() {
        super();
        this.layouts = {
            tts: { cx: 10, cy: 7 },
            pnp_common: { cx: 3, cy: 3 },
        };
        this.state = {
            loading: false,
            imposable: false,
            cards: [],
            cardsCount: 0,
            layout: "tts",
        };
        this.waiting = [];
    }
    componentDidMount() {
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
    }
    load(e) {
        let file_input = e.target;
        var i = file_input.files.length;

        while (i > 0) {
            let file = file_input.files[i - 1];
            let reader = new FileReader();
            switch (file.type) {
                case "image/jpeg":
                case "image/png":
                    reader.onload = this.loadedImage.bind(this, file.name, i);
                    reader.readAsDataURL(file);
                    break;
                case "application/pdf":
                    reader.onload = this.loadedPDF.bind(this, file.name, i);
                    reader.readAsArrayBuffer(file);
                    break;
                default:
                    alert("no loader for " + file.type);
            }
            i--;
        }
        file_input.value = "";
    }

    loadedImage(name, i, e) {
        let image_uuid = this.addWaiting();
        var image = new Image();
        image.title = name;
        image.onload = function (image_uuid, e) {
            this.removeWaiting(image_uuid);
            this.addCard(e.target, e.target.title);
        }.bind(this, image_uuid);
        image.src = e.target.result;
    }

    addCard(img, name) {
        let cards = this.state.cards;
        let card = {
            uuid: this.UUID(),
            img: img,
            name: name,
            count: 1,
        };
        cards.push(card);
        this.setState({ cards: cards });
        return card;
    }

    loadedPDF(name, i, e) {
        let typedarray = new Uint8Array(e.target.result);
        pdfjs.getDocument(typedarray).promise.then(
            function (pdf) {
                var p = pdf.numPages;
                do {
                    let page_uuid = this.addWaiting();
                    pdf.getPage(p).then(
                        function (page_uuid, page) {
                            
                            let viewport = page.getViewport({ scale: 4.166666 });
                            let canvas = document.createElement("canvas");
                            document.body.appendChild(canvas);
                            canvas.setAttribute("style", "display: none;");
                            let context = canvas.getContext("2d");
                            canvas.width = viewport.width;
                            canvas.height = viewport.height;
                            page.render({ canvasContext: context, viewport: viewport }).promise.then(
                                function (canvas) {
                                    this.removeWaiting(page_uuid);
                                    let img = document.createElement("img");
                                    img.setAttribute("src", canvas.toDataURL("image/jpeg"));
                                    img.setAttribute("width", canvas.width);
                                    img.setAttribute("height", canvas.height);
                                    document.body.removeChild(canvas);
                                    this.addCard(img, name + " page " + page.pageNumber);
                                }.bind(this, canvas, page_uuid),
                                function (page_uuid, message) {
                                    this.removeWaiting(page_uuid);
                                    console.log("page.render.reject", message);
                                }.bind(page_uuid)
                            );
                        }.bind(this, page_uuid)
                    );
                } while (p-- > 1);
            }.bind(this)
        );
    }

    updateLayout(e) {
        e.persist();
        this.setState({ layout: e.target.value });
    }

    updateCount(e) {
        e.persist();
        let input = e.target;
        this.updateCard(input.name, "count", input.value);
    }

    updateCard(uuid, prop, value) {
        let cards = this.state.cards;
        for (let index in cards) {
            if (cards[index].uuid == uuid) {
                cards[index][prop] = value;
            }
        }
        this.setState({ cards: cards, cardsCount: cards.length });
    }

    render() {
        return (
            <div className="App">
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-3" id="sidebar">
                            <h1>Deck-Imposer</h1>
                            <div className="step mb-5">
                                <p>
                                    <b>Step 1.</b> Select Images or PDF
                                </p>
                                <div className="form-group">
                                    <input type="file" name="img[]" id="upload" multiple onChange={this.load.bind(this)} accept="image/*,application/pdf" />
                                </div>
                                {this.state.loading == true && <p>Loading...</p>}
                            </div>
                            <div className="step mb-5">
                                <p>
                                    <b>Step 2.</b> Select Layout
                                </p>

                                <div className="form-group">
                                    <select className="form-control" onChange={this.updateLayout.bind(this)}>
                                        <option value="tts">Tabletop Simulator Deck (10x7)</option>
                                        <option value="pnp_common">Common PnP (3x3)</option>
                                    </select>
                                </div>
                            </div>
                            <div className="step mb-5">
                                <p>
                                    <b>Step 3.</b> Set quantity of each card.
                                </p>
                                <div id="cards">{this.renderCards()}</div>
                            </div>
                            <div className="step mb-5">
                                <p>
                                    <b>Step 4.</b> Right click and save imposed image(s).
                                </p>
                            </div>
                        </div>
                        <div className="col-9" id="main">
                            <div id="top"></div>
                            <div id="canvas_container">{this.renderPages()}</div>
                        </div>
                    </div>
                </div>
                <footer className="container my-5">
                    <div className="row">
                        <div className="col-md-4">
                            For info or help, visit <a href="https://github.com/BrianWendt/deck-imposer">GitHub</a>
                        </div>
                        <div className="col-md-4 text-center">GNU General Public License v3.0</div>
                        <div className="col-md-4 text-right">Pay it forward.</div>
                    </div>
                </footer>
            </div>
        );
    }

    renderCards() {
        const items = this.state.cards.map((card) => (
            <div key={card.uuid} className="form-group">
                <div className="row">
                    <div className="col-sm-9">
                        <label>{card.name}</label>
                    </div>
                    <div className="col-sm-3">
                        <input name={card.uuid} value={card.count} onChange={this.updateCount.bind(this)} type="number" min="0" step="1" className="form-control" />
                    </div>
                </div>
            </div>
        ));
        return <div>{items}</div>;
    }

    renderPages() {
        const items = [];
        if (this.state.loading) {
            return <div />;
        }
        let layout = this.layouts[this.state.layout];
        let cards = [];
        let i = 0;
        for (let index in this.state.cards) {
            let card = this.state.cards[index];
            let c = card.count;
            while (c > 0) {
                cards.push(card);
                c--;
                i++;
                if (i == layout.cx * layout.cy) {
                    i = 0;
                    items.push(<Canvas cards={cards} layout={layout} key={Math.random()} />);
                    cards = [];
                }
            }
        }
        items.push(<Canvas cards={cards} layout={layout} key={Math.random()} />);

        return <div>{items}</div>;
    }

    UUID() {
        var dt = new Date().getTime();
        var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
            var r = (dt + Math.random() * 16) % 16 | 0;
            dt = Math.floor(dt / 16);
            return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
        });
        return uuid;
    }

    addWaiting(){
        this.setState({loading: true});
        let uuid = this.UUID();
        this.waiting.push(uuid);
        return uuid;
    }

    removeWaiting(uuid){
        let idx = this.waiting.indexOf(uuid);
        if(idx > -1){
            this.waiting.splice(idx, 1);
        }
        if(this.waiting.length < 1){
            this.setState({loading: false});
        }
    }
}

export default App;
