import React, { createRef } from "react";

class Canvas extends React.Component {
    constructor(props) {
        super(props);
        this.ref = createRef(); 
        this.width = 0;
        this.height = 0;
        this.cx = this.props.layout.cx;
        this.cy = this.props.layout.cy;
    }
    componentDidMount() {
        let canvas = this.ref.current;
        let i = 0;
        for (let index in this.props.cards) {
            let card = this.props.cards[index]; 
            this.drawImage(canvas, card.img, i++);
        }
    }
    drawImage(canvas, image, i) {
        var ctx = canvas.getContext("2d");
        var m = (this.props.layout.margin || 0) * 300;
        if (!this.width || !this.height) {
            canvas.width = this.width = (image.width * this.cx) + (m * (this.cx - 1));
            canvas.height = this.height = (image.height * this.cy) + (m * (this.cy - 1));
        }
        var ox = i % this.cx;
        var oy = Math.floor(i / this.cx);
        var x = (ox * image.width) + (m * ox);
        var y = (oy * image.height) + (m * oy);
        ctx.drawImage(image, x, y, image.width, image.height);
    }
    render() {
        return  (<div className="col-lg-4 col-md-6 mb-3 text-center">
            <canvas ref={this.ref} width={this.width} height={this.height} />
            {this.props.cards.length} cards
        </div>);
    }
}
export default Canvas;
