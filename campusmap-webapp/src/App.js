/*
 * Copyright ©2019 Joshua Ip
 * License: MIT
 */

import React, {Component} from 'react';
import Map from './Map.js';
import Sidebar from './Sidebar.js';
import LoadingScreen from './LoadingScreen.js';

/**
 * The campus maps application. Coordinates the state of the campus map and the sidebar, and requests information from the spark server.
 */
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            startingNode: undefined, 
            destinationNode: undefined,
            locations: undefined,
            path: undefined,
        };
        this.getLocations();

        // Prevents scroll bars from showing up, which is important for the aesthetic of the app as a whole.
        // Scrolling around the map is managed by the Map class
        document.body.style.overflow = 'hidden';
    }

    /**
     * Retrieves a list of locations from the spark server.
     * alerts the user if the server is inaccessible and the locations cannot be retrieved.
     */
    async getLocations() {
        try {
            let locationPromise = fetch("http://localhost:4567/getLocations");
            let location = await locationPromise;
            let parsingLocations = location.json();
            let parsedLocations = await parsingLocations;
            this.setState({
                locations: parsedLocations
            });
        } catch(e) {
            alert("Unable to retrieve the list of destinations because the server is not currently running. Please refresh the page.");
        }
    }

    /**
     * Sends a request to the server to find a path between the selected source and destination
     */
    async findPath() {
        if (this.state.startingNode !== undefined && this.state.destinationNode !== undefined) {
            try {
                let pathPromise = fetch("http://localhost:4567/findPath?src=" + this.state.startingNode.shortName + "&dest=" + this.state.destinationNode.shortName);
                let path = await pathPromise;
                if (!path.ok) {
                    alert("No path exists between the source and destination. Please pick a new source and destination.");
                }
                let parsingPath = path.json();
                let parsedPath = await parsingPath;
                this.setState({
                    path: parsedPath
                })
            } catch(e) {
                alert("Unable to find a path because the server is not currently running.");
            }
        } else {
            this.setState({path: undefined});
        }
    }

    /**
     * A callback function for updating the source node in the path
     * @param {*} newStartingNode 
     *  A string representing the new destination, required to be one of the short names from the campus map
     */
    updateSource = (newStartingNode) => {
        this.setState({ startingNode: newStartingNode }, () => {this.findPath()});
    }

    /**
     * A callback function for updating the destination node in the path
     * @param {*} newDestination
     *  A string representing the new destination, required to be one of the short names from the campus map
     */
    updateDest = (newDestination) => {
        this.setState({ destinationNode: newDestination }, () => {this.findPath()});
    }

    /**
     * Returns the page to its original state by refreshing the page.
     */
    reset = () => {
        window.location.reload();
    }

    render() {
        // If we haven't loaded the locations, we present the loading screen
        // Otherwise, present the map
        if (this.state.locations === undefined) {
            return (<div> 
                <LoadingScreen />
            </div>);
        } else {    
            return (<div width={window.innerWidth} height={window.innerHeight} padding={0} margin={0}>
                <Map startingNode={this.state.startingNode} 
                    destinationNode={this.state.destinationNode}
                    locations={this.state.locations}
                    updateSource={this.updateSource} 
                    updateDestination={this.updateDest} 
                    path={this.state.path}/>
                <Sidebar startingNode={this.state.startingNode} 
                    destinationNode={this.state.destinationNode}
                    locations={this.state.locations}
                    updateSource={this.updateSource} 
                    updateDestination={this.updateDest}
                    path={this.state.path}
                    reset={this.reset} />
            </div>);
        }
    }

}

export default App;
