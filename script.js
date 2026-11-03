const mic = document.getElementById("mic");
const status = document.getElementById("status");
const message = document.getElementById("message");

const save = document.getElementById("save");
const language = document.getElementById("language");
const apikey = document.getElementById("apikey");

save.addEventListener("click", () => {
  localStorage.setItem("jd_language", language.value);
  localStorage.setItem("jd_key", apikey.value);
  status.innerText = "Settings Saved Successfully";
});

language.value =
  localStorage.getItem("jd_language") || "hi-IN";

apikey.value =
  localStorage.getItem("jd_key") || "";

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

  status.innerText = "Listening...";
  message.innerText = "SUN RAHA HOON";

  recognition.onresult = (event) => {
    const spokenText = event.results[0][0].transcript;

    status.innerText = "You said: " + spokenText;
    message.innerText = "VOICE RECEIVED";

    if ("speechSynthesis" in window) {
      const speech = new SpeechSynthesisUtterance(
        "Aapne kaha " + spokenText
      );
      speech.lang = language.value;
      speechSynthesis.speak(speech);
    }
  };

  recognition.onerror = () => {
    status.innerText = "Microphone error. Try again.";
  };

  recognition.onend = () => {
    message.innerText = "TAP TO START";
  };

  recognition.start();
});
