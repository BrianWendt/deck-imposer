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
        if (!this.width || !this.height) {
            canvas.width = this.width = image.width * this.cx;
            canvas.height = this.height = image.height * this.cy;
        }
        var ox = i % this.cx;
        var oy = Math.floor(i / this.cx);
        ctx.drawImage(image, ox * image.width, oy * image.height, image.width, image.height);
    }
    render() {
        return  <canvas ref={this.ref} width={this.width} height={this.height} />;
    }
}
export default Canvas;
