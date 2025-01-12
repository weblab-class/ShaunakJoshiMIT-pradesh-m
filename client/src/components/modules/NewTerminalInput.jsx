import React, { useState } from "react";

/**
 * NewTerminalInput is a parent component for all
 * terminal input components
 *
 * Proptypes
 * @param {({value}) => void} onSubmit: (function) triggered when this post is submitted, takes {storyId, value} as parameters
 */

const NewTerminalInput = (props) => {
    const [value, setValue] = useState("");

    const handleChange = (event) => {
        setValue(event.target.value);
    };

    // const handleSubmit = (event) => {
    //     event.preventDefault();
    //     props.onSubmit && props.onSubmit(value)
    //     setValue("")
    // };

    return (
        <div>
            <p>
                {props.profileID}
                <input
                    type = "text"
                    onChange = {handleChange}
                    // onSubmit = {handleSubmit}
                    onSubmit = {props.onSubmit}
                    className = "NewTerminalInput-input"

                />
            </p>
        </div>




    )
}


export default NewTerminalInput;
