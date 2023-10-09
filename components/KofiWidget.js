import { useEffect, useState } from 'react';
const KofiWidget = () => {
    // store the load state with useState
    const [loaded, setLoaded] = useState(false);
    // use the useEffect hook to update state when the script loads
    useEffect(() => {
        // create script element for the Ko-Fi script
        const kofiScript = document.createElement("script");
        // set the src to the script from Ko-Fi's cdn
        kofiScript.src = "https://storage.ko-fi.com/cdn/scripts/overlay-widget.js"
        // set the async property to true
        kofiScript.async = true;
        // add a listener for the script loading and update state
        kofiScript.addEventListener('load', () => setLoaded(true));
        // append the script to the document body
        document.body.appendChild(kofiScript);
    }, []);

    // add another useEffect to draw the widget
    useEffect(() => {
        if (!loaded) return; // return out if not loaded
        window.kofiWidgetOverlay.draw('prb01', {
        'type': 'floating-chat',
        'floating-chat.donateButton.text': 'Buy me a beer',
        'floating-chat.donateButton.background-color': '#4ABDAC',
        'floating-chat.donateButton.text-color': '#000'
        });
    }, [loaded]); // the hook will depend on the loaded state

    return null;
}
export default KofiWidget;