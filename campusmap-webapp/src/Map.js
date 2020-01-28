/*
 * Copyright ©2019 Joshua Ip
 * License: MIT
 */

import React, { Component } from 'react';
import "./Map.css";

/**
 * The map to be displayed on the Campus maps application
 * Supports panning, highlighting locations when the user mouses over them, selecting locations by clicking,
 * and if a location is selected by other means, it will be shown on the map.
 */
class Map extends Component {
    // The distance in pixels that the cursor has to be from a location for the location to be marked visually on the map 
    static LOCATION_RADIUS = 20;

    constructor(props) {
        super(props);
        this.state = {
            backgroundImage: undefined,
            width: window.innerWidth, // Width of the canvas
            height: window.innerHeight, // Height of the canvas

            // The origin of the image on the canvas, used to pan the image
            originX: -1250,
            originY: -1000,

            // If the user mouses over a location, it will be saved here
            currentHighlightedLocation: undefined,

        };
        this.canvas = React.createRef();

        // Prepare the image to be loaded
        this.fetchAndSaveImage();
        
        // Used to monitor the mouse's current state
        this.mouse = {
            pos: { x: 0, y: 0 },
            worldPos: { x: 0, y: 0 },
            posLast: { x: 0, y: 0 },
            button: false,
            overId: "",  // id of element mouse is over
            mouseHeldDown: false,
            whichWheel: -1, // first wheel event will get the wheel
            wheel: 0
        };

        // Current view transforms, used to convert from a location on the screen to a location on the map
        this.matrix = [1, 0, 0, 1, 0, 0]; 
        this.invMatrix = [1, 0, 0, 1, 0, 0]; 
    }

    /**
     * Only when the map is mounted, we should create listeners so that the user can interact with the map
     */
    componentDidMount() {
        // add event listeners to document so that the state of the user's mouse is captured both on and off the canvas (on the sidebar)
        document.addEventListener('mousemove', this.mouseEvent);
        document.addEventListener('mousedown', this.mouseEvent);
        document.addEventListener('mouseup', this.mouseEvent);
        document.addEventListener('mousewheel', this.mouseEvent);
        document.addEventListener('wheel', this.mouseEvent);

        // Allows "this" to work in the callback function
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        // Makes the canvas scale whenever the user resizes the screen to fill the entire screen
        window.addEventListener('resize', this.updateWindowDimensions);
        
        // We only update the window dimensions if the image has actually been powered
        if (this.state.backgroundImage !== undefined) {
            this.updateWindowDimensions();        
        }
    }


    /**
     * Whenever the state updates, we need to redraw the map.
     */
    componentDidUpdate() {
        this.redraw();
    }

    /**
     * Used along with a listener to change the width of the canvas to match the window whenever it changes size
     */
    updateWindowDimensions() {
        // If the width/height of the window has changed
        if (this.state.width !== window.innerWidth || this.state.height !== window.innerHeight) {
            this.setState({ width: window.innerWidth, height: window.innerHeight });
            this.canvas.current.width = this.state.width;
            this.canvas.current.height = this.state.height;
            
            // These correct the position of the background Image so that resizing can't make the window display 
            // an out of bounds area off the map
            if (this.state.originX + this.state.backgroundImage.width < (this.state.width)) {
                this.setState({ originX: this.state.width - this.state.backgroundImage.width });
            }
            if (this.state.originY + this.state.backgroundImage.height < (this.state.height)) {
                this.setState({ originY: this.state.height - this.state.backgroundImage.height });
            }

            this.redraw();
        }
    }

    /**
     * Creates an Image object, and sets a callback function
     * for when the image is done loading (it might take a while).
     */
    fetchAndSaveImage() {
        let background = new Image();
        background.onload = () => {
            this.setState({ backgroundImage: background });
        };
        // Once our callback is set up, we tell the image what file it should
        // load from. This also triggers the loading process.
        background.src = "./campus_map.jpg";
    }

    /**
     * Draws the campus map and any annotations (marked locations, paths) that are on it
     */
    redraw = () => {
        let canvas = this.canvas.current;
        let context = canvas.getContext("2d");

        // Once the image has loaded, we can draw the campus map.
        if (this.state.backgroundImage !== undefined) {
            canvas.width = this.state.width;
            canvas.height = this.state.height;
            context.drawImage(this.state.backgroundImage, this.state.originX, this.state.originY, this.state.backgroundImage.width, this.state.backgroundImage.height);


            // If the user has selected a start, a destination, or is mousing over a location, different colored
            // circles are used to highlight them and indicate to the user that this is a location.
            if (this.state.currentHighlightedLocation !== undefined) {
                this.drawCircle('yellow', this.state.currentHighlightedLocation);
            }
            if (this.props.startingNode !== undefined) {
                this.drawCircle('green', this.props.startingNode);
            }
            if (this.props.destinationNode !== undefined) {
                this.drawCircle('blue', this.props.destinationNode);
            }

            // If the user has found a path, draw it on the map 
            if (this.props.path !== undefined && this.props.startingNode !== undefined && this.props.destinationNode !== undefined) {
                for (let pathSegment of this.props.path.path) {
                    context.beginPath();
                    context.lineWidth = "5";
                    context.strokeStyle = "yellow";
                    let start = {};
                    let end = {};
                    this.toScreen(pathSegment.start, start);
                    this.toScreen(pathSegment.end, end);
                    context.moveTo(start.x, start.y);
                    context.lineTo(end.x, end.y);
                    context.stroke();
                }
            }
        }


    }

    /**
     * Checks if two points are within a certain radius from each other 
     * @param {*} point1
     *  An object with an x and a y field 
     * @param {*} point2 
     *  An object with a x and y field
     */
    isIntersect(point1, point2) {
        return Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2) < Map.LOCATION_RADIUS;
    }


    /**
     * Draws a circle on the canvas of the specified color and location
     * @param {*} color
     *  A string representing the color of the circle to be drawn
     * @param {*} location
     *  An object with x and y fields. The x and y field will be the center of the circle.
     */
    drawCircle(color, location) {
        let context = this.canvas.current.getContext("2d");
        context.beginPath();
        context.arc(location.x + this.state.originX, location.y + this.state.originY, Map.LOCATION_RADIUS, 0, 2 * Math.PI, false);
        context.lineWidth = 5;
        context.strokeStyle = color;
        context.stroke();
    }

    /**
     * Responds to the user's mouse movements when a listener detects the movement
     * @param {*} event 
     *  The event receieved from the mouse's movements
     */
    mouseEvent = (event) => {
        // Update the object that the this.mouse is over (sidebar or map)
        this.mouse.overId = event.target.id;

        // If the this.mouse is on the canvas, we know the user is trying to pan or zoom.
        // The user may also have held down the this.mouse, and is currently off of the map (on the sidebar), and we should still
        // pan the map if this is the case
        if (this.state.backgroundImage !== undefined) {
            if (event.target.id === "canvas" || this.mouse.mouseHeldDown) {
                // Update the this.mouse coordinates
                this.mouse.posLast.x = this.mouse.pos.x;
                this.mouse.posLast.y = this.mouse.pos.y;
                this.mouse.pos.x = event.clientX - this.canvas.current.offsetLeft;
                this.mouse.pos.y = event.clientY - this.canvas.current.offsetTop;


                // Get where on the map the this.mouse is
                this.toWorld(this.mouse.pos, this.mouse.worldPos);

                // If the user moved the mouse and is holding down the button, pan the map
                if (event.type === "mousemove" && this.mouse.button) {
                    let deltaX = this.mouse.pos.x - this.mouse.posLast.x;
                    let deltaY = this.mouse.pos.y - this.mouse.posLast.y;
                    // Used to bound the user panning around the map
                    if (!(this.state.originX + this.state.backgroundImage.width + deltaX < (this.state.width)) &&
                        !(this.state.originX + deltaX > 0) &&
                        !(this.state.originY + this.state.backgroundImage.height + deltaY < (this.state.height)) &&
                        !(this.state.originY + deltaY > 0)) {
                        this.setState({
                            originX: this.state.originX + deltaX,
                            originY: this.state.originY + deltaY
                        });
                    }
                }

                // If the use moved the mouse and isn't holding down a button, update the currently highlighted location
                else if (event.type === "mousemove") {
                    if (this.state.currentHighlightedLocation === undefined || !this.isIntersect(this.state.currentHighlightedLocation, this.mouse.worldPos)) {
                        for (let location of this.props.locations) {
                            if (this.isIntersect(location, this.mouse.worldPos)) {
                                this.setState({ currentHighlightedLocation: location });
                                break;
                            }
                        }
                        if (this.state.currentHighlightedLocation !== undefined && !this.isIntersect(this.state.currentHighlightedLocation, this.mouse.worldPos)) {
                            this.setState({ currentHighlightedLocation: undefined })
                        }

                    }
                }

                // If the user clicked, update the source or destination to reflect this.
                else if (event.type === "mousedown") {
                    this.mouse.button = true; this.mouse.mouseHeldDown = true
                    if (this.state.currentHighlightedLocation !== undefined && this.isIntersect(this.state.currentHighlightedLocation, this.mouse.worldPos)) {
                        // If the user clicked on the source or destination node, they want to deselect it.
                        if (this.state.currentHighlightedLocation === this.props.startingNode) {
                            this.props.updateSource(undefined);                            
                        } else if (this.state.currentHighlightedLocation === this.props.destinationNode) {
                            this.props.updateDestination(undefined);
                        } else {
                            // If the user hasn't selected a source or destination, choose the currenly highlighted location as the source/destination
                            if (this.props.startingNode === undefined) {
                                this.props.updateSource(this.state.currentHighlightedLocation);
                            } else {
                                this.props.updateDestination(this.state.currentHighlightedLocation);
                            }    
                        }
                    }
                }

                // If the user stopped holding down the mouse, update the state so that we don't drag the map along with their cursor
                // Also update what the cursor looks like to indicate to the user what they are doing
                else if (event.type === "mouseup") {
                    this.mouse.button = false; this.mouse.mouseHeldDown = false
                    if (this.mouse.overId === "canvas") {
                        this.canvas.current.style.cursor = "move";
                    } else {
                        this.canvas.current.style.cursor = "default";
                    }
                }
            }
        }
    }

    // convert a coordinate on the screen to a coordinate in the map
    // Output written to point, input from the parameter "from"
    toWorld(from, point) {
        var xx, yy;

        xx = from.x - this.matrix[4];
        yy = from.y - this.matrix[5];

        point.x = xx * this.invMatrix[0] + yy * this.invMatrix[2];
        point.y = xx * this.invMatrix[1] + yy * this.invMatrix[3];

        point.x = point.x - this.state.originX;
        point.y = point.y - this.state.originY;
        return point;
    }

    // converts a coordinate on the map to a coordinate on the screen
    // Output written to point, input from the parameter "from"
    toScreen(from, point) {
        point.x = from.x * this.matrix[0] + from.y * this.matrix[2] + this.matrix[4];
        point.y = from.x * this.matrix[1] + from.y * this.matrix[3] + this.matrix[5];

        point.x = point.x + this.state.originX;
        point.y = point.y + this.state.originY;
        return point;
    }

    render() {
        return (
            <canvas ref={this.canvas} style={{zIndex: 1}} id="canvas" />
        )
    }
}

export default Map;