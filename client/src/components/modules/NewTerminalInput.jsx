import React, { useState } from "react";

/**
 * NewTerminalInput is a parent component for all
 * terminal input components
 *
 * Proptypes
 * @param {string} profileID is the placeholder text
 * @param {string} storyId optional prop, used for comments
 * @param {({storyId, value}) => void} onSubmit: (function) triggered when this post is submitted, takes {storyId, value} as parameters
 */

const NewTerminalInput = (props) => {
    const [value, setValue] = useState("");

    // const handleChange = ();
}
