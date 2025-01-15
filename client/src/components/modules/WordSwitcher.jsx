import react, { useState, useEffect, useRef } from "react";



const WordSwitcher = (props) => {
    let words = props.words
    console.log(words)
    const [currWord, switchWord] = useState(words[0]);
    let index = useRef(0);
    useEffect(() => {

        let interval = setInterval(() => {
            switchWord(words[index.current]);
            index.current++;

            if (index.current >= words.length) {
                index.current = 0;
            }
        }, 1600);

        return () => clearInterval(interval);
    })

    return (
        <h1>{currWord}</h1>
    )
}
export default WordSwitcher;
