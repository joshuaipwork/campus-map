/*
 * Copyright ©2019 Joshua Ip
 * License: MIT
 */

import React, { Component } from 'react';

/**
 * The sidebar for the campus maps app
 * Displays the name of the locations that the user selected on the map, and if the dropdown menu changes it updates
 * the starting and destination node of the app. Also includes a reset button and options to expand and compress the sidebar.
 */
class Sidebar extends Component {

    constructor(props) {
        super(props)
        this.state = {
            sideBarWidth: 300,
            sideBarPadding: '8px 8px 8px 32px',
            expandButtonOpacity: 0
        }
    }

    /**
     * Changes the style to expand the sidebar
     */
    openSidebar = () => {
        this.setState({
            sideBarWidth: 300,
            sideBarPadding: '8px 8px 8px 32px',
            expandButtonOpacity: 0
        });
    }

    /**
     * Changes the style to compress the sidebar
     */
    closeSidebar = () => {
        this.setState({
            sideBarWidth: 0,
            sideBarPadding: '0px',
            expandButtonOpacity: 1
        });
    }

    /**
     * Converts the list of locations to options which can be used on the dropdown menu
     */
    listLocations() {
        let result = [];
        result.push({ key: -1, label: "No location selected", value: undefined})
        for (let i = 0; i < this.props.locations.length; i++) {
            result.push({ key: i, label: this.props.locations[i].longName, value: this.props.locations[i].shortName });
        }
        return result;
    }

    /**
     * Wrapper function which allows the starting location to be updated once selected through the sidebar
     */
    selectNewSource = (event) => {
        var index = event.nativeEvent.target.selectedIndex;
        let location = this.props.locations[event.nativeEvent.target[index].index - 1];
        if (location !== undefined) {
            this.props.updateSource(location);
        }
    }

    /**
     * Wrapper function which allows the destination to be updated once selected through the sidebar
     */
    selectNewDestination = (event) => {
        var index = event.nativeEvent.target.selectedIndex;
        let location = this.props.locations[event.nativeEvent.target[index].index - 1];
        if (location !== undefined) {
            this.props.updateDestination(location)
        }
    }

    render() {
        /**
         * These styles make the sidebar look pretty
         */
        this.sidebarStyle = {
            'height': '100%',
            'width': this.state.sideBarWidth,
            'position': 'absolute',
            'zIndex': 4,
            'top': 0,
            'left': 0,
            'backgroundColor': '#111',
            'overflow': 'hidden',
            'transition': '0.5s',
            'padding': this.state.sideBarPadding,
            'color': '#f1f1f1'
        }

        this.buttonStyle = {
            'backgroundColor': '#4CAF50',
            'color': 'white',
            'border': '1px solid green',
            'padding': '5px 5px',
            'textAlign': 'center',
            'textDecoration': 'none',
            'display': 'inline-block',
            'fontSize': '16px',
        }

        this.expandButtonStyle = {
            'backgroundColor': '#4CAF50',
            'position': 'absolute',
            'color': 'white',
            'opacity': this.state.expandButtonOpacity,
            'transition': '0.5s',
            'top': 20,
            'left': 20,
            'border': 'none',
            'padding': '30px 30px',
            'textAlign': 'center',
            'textDecoration': 'none',
            'fontSize': '24px',
        }

        let options = this.listLocations();

        // Translate the startingnode to an option in the select dropdown menu
        let startValue = this.props.startingNode;
        if (startValue !== undefined) {
            startValue = startValue.shortName;
        }

        // Translate the destination node to an option in the select dropdown menu
        let destValue = this.props.destinationNode;
        if (destValue !== undefined) {
            destValue = destValue.shortName;
        }

        return (
            <div>
                <button style={this.expandButtonStyle} onClick={this.openSidebar}>Expand Sidebar</button>
                <div style={this.sidebarStyle}>
                    <h2>Campus Map</h2>
                    <button onClick={this.closeSidebar} style={this.buttonStyle}>Close Sidebar</button>
                    <p>Click and drag to pan the map. Valid locations will be highlighted by yellow circles when you mouse over them. Select
                        source and destination by clicking on them or selecting them with the source and destination fields below. Once a valid
                        set of locations is selected, the shortest path will be displayed in yellow.</p>
                    <button onClick={this.props.reset} style={this.buttonStyle}>Reset</button>
                    <p></p>
                    {/*Lists the sources and destinations once they are retrieved from the server. */}
                    <h2>Starting Location</h2>
                    <select key="sources" onChange={this.selectNewSource} style={{width: '300px', backgroundColor: 'black', color: 'white'}} value={startValue}>
                        {options.map(option => (
                            <option key={option.key} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <p></p>
                    <h2>Destination</h2>
                    <select key="dests" onChange={this.selectNewDestination} style={{width: '300px', backgroundColor: 'black', color: 'white'}} value={destValue}>
                    {options.map(option => (
                            <option key={option.key} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                        </select>
                    <p></p>

                </div>
            </div>);
    }
}


export default Sidebar;