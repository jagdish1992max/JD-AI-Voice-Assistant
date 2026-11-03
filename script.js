
const WORKER_URL =
  "https://jd-ai-voice-assistant.jagdishjd6.workers.dev/";

const mic = document.getElementById("mic");
const status = document.getElementById("status");
const message = document.getElementById("message");
const save = document.getElementById("save");
const language = document.getElementById("language");
const apikey = document.getElementById("apikey");

language.value = localStorage.getItem("jd_language") || "hi-IN";

// API key is stored securely in Cloudflare Worker.
// No API key is needed in this website field.
apikey.placeholder = "API Key secured in Cloudflare";

save.addEventListener("click", () => {
  localStorage.setItem("jd_language", language.value);
  status.innerText = "Settings Saved Successfully!";
});

async function askGemini(text) {
  const response = await fetch(WORKER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: text
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Gemini request failed");
  }

  if (!data.reply) {
    throw new Error("Gemini returned an empty reply");
  }

  return data.reply;
}

mic.addEventListener("click", () => {
  const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    status.innerText = "Voice recognition not supported";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = language.value;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  mic.style.pointerEvents = "none";
  status.innerText = "Listening...";
  message.innerText = "SUN RAHA HOON";

  recognition.onresult = async (event) => {
    const spokenText = event.results[0][0].transcript;

    status.innerText = "JD AI is thinking...";
    message.innerText = "THINKING...";

    try {
      const reply = await askGemini(spokenText);

      status.innerText = reply;
      message.innerText = "JD AI REPLIED";

      if ("speechSynthesis" in window) {
        speechSynthesis.cancel();

        const speech = new SpeechSynthesisUtterance(reply);
        speech.lang = language.value;
        speech.rate = 1;
        speech.pitch = 1;

        speechSynthesis.speak(speech);
      }
    } catch (error) {
      status.innerText = "Error: " + error.message;
      message.innerText = "TRY AGAIN";
    }
  };

  recognition.onerror = (event) => {
    status.innerText = "Mic error: " + event.error;
    message.innerText = "TAP TO START";
  };

  recognition.onend = () => {
    mic.style.pointerEvents = "auto";
    if (message.innerText === "SUN RAHA HOON") {
      message.innerText = "TAP TO START";
    }
  };

  try {
    recognition.start();
  } catch (error) {
    mic.style.pointerEvents = "auto";
    status.innerText = error.message;
  }
});
