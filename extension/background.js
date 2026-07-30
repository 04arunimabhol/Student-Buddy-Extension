chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { endpoint, payload } = request;
    const { apiKey, ...body } = payload;

    const headers = {
        "Content-Type": "application/json",
    };

    // Only send Authorization if the user has provided an API key
    if (apiKey) {
        headers["Authorization"] = `Bearer ${apiKey}`;
    }

    const LOCAL_URL = "http://127.0.0.1:3000";
    const PROD_URL = "https://student-buddy-extension-rust.vercel.app";

    fetch(`${PROD_URL}/${endpoint}`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
    })
        .then((res) => res.json())
        .then((data) => sendResponse(data))
        .catch((err) => {
            console.error("Background fetch error:", err);
            sendResponse(null);
        });

    return true;
});