chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { endpoint, payload } = request;

    fetch(`http://127.0.0.1:3000/${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type" : "application/json",
        },
        body: JSON.stringify(payload),
    })
    .then((res) => res.json())
    .then((data) => sendResponse(data))
    .catch((err) => {
        console.error("Background fetch error: " , err);
        sendResponse(null);
    });

    return true;
});