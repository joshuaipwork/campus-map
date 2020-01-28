/*
 * Copyright ©2019 Joshua Ip
 * License: MIT
 */

import React, {Component} from 'react';

/**
 * Draws a beautiful loading animation on the screen.
 */
class LoadingScreen extends Component {

    constructor(props) {
        super(props);
        this.canvas = React.createRef();
        this.state = { seconds: 0 };
    }

    /**
     * Sets up a timer for the loading animation
     */
    componentDidMount() {
        this.myInterval = setInterval(() => {this.setState({ seconds: this.state.seconds + 0.02 }) }, 16);
    }
    
    /**
     * Whenever the interval completes, it updates the state which triggers a redraw for the loading animation
     */
    componentDidUpdate() {
        this.loadingAnimation();
    }

    /**
     * Removes timer once this loading screen has stopped rendering for performance
     */
    componentWillUnmount() {
        clearInterval(this.myInterval);
    }

    /**
     * Draws a slick loading animation on the canvas
     */
    loadingAnimation() {
        let ctx = this.canvas.current.getContext("2d");
        this.canvas.current.width = window.innerWidth;
        this.canvas.current.height = window.innerHeight;

        let color = 0;
        for(let i=9; i < 1500; i+=2) {
            let distanceFromCenter = 3 / (9.1 - (this.state.seconds + i / 99) % 9);
            let radians = i*9 + Math.sin(i*4 + this.state.seconds);
            color++;

            ctx.beginPath();
            ctx.strokeStyle = '#' + color;
            ctx.lineWidth = distanceFromCenter * distanceFromCenter;
            ctx.arc(this.canvas.current.width / 2, this.canvas.current.height / 2, distanceFromCenter * 49, radians, radians + 0.6);
            ctx.stroke();
        }
    }

    render() {
        return(<canvas ref={this.canvas} width={window.innerWidth} height={window.innerHeight} />);
    }
}

export default LoadingScreen;