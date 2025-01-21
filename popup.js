document.addEventListener("DOMContentLoaded", async () => {
  const originalUrlElement = document.getElementById("original-url");
  const statusMessage = document.getElementById("status-message");

  try {
    // Fetch the current active tab's URL
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if the URL is valid
    if (tab && tab.url) {
      const longUrl = tab.url;
      originalUrlElement.textContent = longUrl;

      // Automatically shorten the URL
      const bitlyToken = "1877dda5db8df85b126358a803ce00c98b0bb61b";
      const apiUrl = "https://api-ssl.bitly.com/v4/shorten";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${bitlyToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ long_url: longUrl }),
      });

      if (response.ok) {
        const data = await response.json();
        const shortUrl = data.link;

        // Automatically copy the shortened URL
        await navigator.clipboard.writeText(shortUrl);

        // Display success message
        statusMessage.textContent = `Shortened URL copied to clipboard: ${shortUrl}`;
        statusMessage.style.color = "green";
      } else {
        const errorData = await response.json();

        // Handle specific errors
        if (errorData.message === "INVALID_ARG_LONG_URL") {
          statusMessage.textContent = "Error: Needs to be a valid page URL (e.g., not a Chrome internal page).";
        } else {
          statusMessage.textContent = `Error: ${errorData.message || "Unable to shorten URL."}`;
        }
        statusMessage.style.color = "red";
      }
    } else {
      originalUrlElement.textContent = "Error: Unable to retrieve the current tab's URL.";
    }
  } catch (error) {
    // Catch unexpected errors
    originalUrlElement.textContent = "Error: Unable to load the URL.";
    statusMessage.textContent = error.message;
    statusMessage.style.color = "red";
  }
});
