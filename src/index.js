import Vapi from "@vapi-ai/web";

const statusDisplay = document.getElementById("status");
const speakerDisplay = document.getElementById("speaker");
const volumeDisplay = document.getElementById("volume");
const vapiTyping = document.getElementById("vapiTyping");
const vapiStatusMessage = document.getElementById("vapiStatusMessage");
const chatWindow = document.getElementById("chat");

const apiKey = process.env.VAPI_API_KEY;
const vapi = new Vapi("VAPI_API_KEY");

let connected = false;
let assistantIsSpeaking = false;
let volumeLevel = 0;
let callActive = false;
const maxSpread = 30; // Maximum spread of the shadow in pixels

// Vapi Event Listeners
vapi.on("call-start", function () {
  connected = true;
  updateUI();
});

vapi.on("call-end", function () {
  connected = false;
  updateUI();

  callWithVapi.style.boxShadow = `0 0 0px 0px rgba(58,25,250,0.7)`;
});

vapi.on("speech-start", function () {
  assistantIsSpeaking = true;
  updateUI();
});

vapi.on("speech-end", function () {
  assistantIsSpeaking = false;
  updateUI();
});

vapi.on("message", (message) => {
  if (message.type === "function-call") {
    // If the ChangeColor function was calles
    if (message.functionCall && message.functionCall.name === "ChangeColor") {
      // Don't forget to sanitzie the values when building this in a real application
      callWithVapi.style.backgroundColor =
        message.functionCall.parameters.ColorCode;
    }

    // If the ChangeColor function was calles
    if (message.functionCall && message.functionCall.name === "WriteText") {
      // Don't forget to sanitzie the values when building this in a real application
      vapiTyping.textContent = message.functionCall.parameters.Text;
    }
  }

  // Adds a message to the background chat
  if (message.type === "conversation-update") {
    updateChat(message);
  }
});

vapi.on("volume-level", function (level) {
  volumeLevel = level; // Level is from 0.0 to 1.0

  // Calculate the spread directly based on the volume level
  const spread = volumeLevel * maxSpread;

  volumeDisplay.textContent = `Volume: ${volumeLevel.toFixed(3)}`; // Display up to 3 decimal places for simplicity

  // Update the box shadow
  const callWithVapi = document.getElementById("callWithVapi");
  callWithVapi.style.boxShadow = `0 0 ${spread}px ${spread / 2}px rgba(58,25,250,0.7)`;
});

vapi.on("error", function (error) {
  connected = false;

  if (error.error.message) {
    vapiStatusMessage.textContent = error.error.message;
  }

  updateUI();
});

callWithVapi.addEventListener("click", function () {
  if (!callActive) {
    callActive = true;
    callWithVapi.style.backgroundColor = "#007aff";
    vapi.start(assistantOptions);
  } else {
    callActive = false;
    callWithVapi.style.backgroundColor = "#858585";
    vapi.stop();
  }
});

// Initialize background with the correct color
callWithVapi.style.backgroundColor = "#858585";

function updateChat(conversationUpdate) {
  chatWindow.innerHTML = ""; // Clear the chat window before adding new messages

  conversationUpdate.conversation.forEach((message) => {
    var messageDiv = document.createElement("div");
    messageDiv.classList.add("message");

    // Add specific class based on the role
    switch (message.role) {
      case "assistant":
        messageDiv.classList.add("assistant");
        break;
      case "user":
        messageDiv.classList.add("user");
        break;
      case "tool": // You might want a different style for tool responses
        messageDiv.classList.add("tool");
        break;
    }

    // Set text content and handle tool calls if they exist
    if (message.content) {
      messageDiv.textContent = message.content;
    } else if (message.tool_calls && message.tool_calls.length > 0) {
      // Example: Append a generic message or handle differently
      messageDiv.textContent = "Processing request...";
    }

    chatWindow.appendChild(messageDiv);
  });

  // Scroll to the bottom of the chat window
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function updateUI() {
  // Update the status
  statusDisplay.textContent = `Status: ${connected ? "Connected" : "Disconnected"}`;

  // Update the speaker
  speakerDisplay.textContent = `Speaker: ${assistantIsSpeaking ? "Assistant" : "User"}`;
}

const assistantOptions = {
  name: "Ava",
  voice: {
    voiceId: "paola",
    provider: "11labs",
    stability: 0.5,
    similarityBoost: 0.75,
  },
  model: {
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "Ava is a sophisticated AI training assistant, crafted by experts in customer support and AI development. You are a helpful assistant. Using the provided context, answer the user's question to the best of your ability using the resources provided. Introduce your self, describe your mission and ask the user if they are interested in buying or selling their home. Also, inform the user that they can drop in a picture of a house they like and the agent can look for a similar listing. Lastly provide the "link" to Jackie's Current Listings. Your Name is “Ava.” You are the Ai Real Estate Assistant to “Jackie Mahony.” Your main objectives are lead generation, booking appointments, answering FAQs, and other real estate related activities. You will assist the users to find homes and book a in-person showing with Jackie. Designed with the persona of a seasoned customer support agent in her early 30s, Ava combines deep technical knowledge with a strong sense of emotional intelligence. Her voice is clear, warm, and engaging, featuring a neutral accent for widespread accessibility. Ava's primary role is to serve as a dynamic training platform for customer support agents, simulating a broad array of service scenarios—from basic inquiries to intricate problem-solving challenges. Ava's advanced programming allows her to replicate diverse customer service situations, making her an invaluable tool for training purposes. She guides new agents through simulated interactions, offering real-time feedback and advice to refine their skills in handling various customer needs with patience, empathy, and professionalism. Ava ensures every trainee learns to listen actively, respond thoughtfully, and maintain the highest standards of customer care. Ava interacts mainly through audio, adeptly interpreting spoken queries and replying in kind. This capability makes her an excellent resource for training agents, preparing them for live customer interactions. She's engineered to recognize and adapt to the emotional tone of conversations, allowing trainees to practice managing emotional nuances effectively. Ava encourages trainees to practice active listening, acknowledging every query with confirmation of her engagement, e.g., "Yes, I'm here. How can I help?" She emphasizes the importance of clear, empathetic communication, tailored to the context of each interaction. Ava demonstrates how to handle complex or vague customer queries by asking open-ended questions for clarification, without appearing repetitive or artificial. She teaches trainees to express empathy and understanding, especially when customers are frustrated or dissatisfied, ensuring issues are addressed with care and a commitment to resolution. Ava prepares agents to escalate calls smoothly to human colleagues when necessary, highlighting the value of personal touch in certain situations. Ava's overarching mission is to enhance the human aspect of customer support through comprehensive scenario-based training. She's not merely an answer machine but a sophisticated platform designed to foster the development of knowledgeable, empathetic, and adaptable customer support professionals.",
      },
    ],
    provider: "openai",
    functions: [
      {
        name: "ChangeColor",
        async: false,
        parameters: {
          type: "object",
          properties: {
            ColorCode: {
              type: "string",
              description: "The HEX color code including the #",
            },
          },
        },
        description: "Changes the color of a HTML element",
      },
      {
        name: "WriteText",
        async: false,
        parameters: {
          type: "object",
          properties: {
            Text: {
              type: "string",
              description: "The text to write",
            },
          },
        },
        description: "Writes text on a website on user request",
      },
    ],
    maxTokens: 250,
    temperature: 0.7,
    emotionRecognitionEnabled: true,
  },
  recordingEnabled: true,
  firstMessage: "Hello, this is Ava. Jackie's  How may I assist you today?",
  voicemailMessage:
    "You've reached our voicemail. Please leave a message after the beep, and we'll get back to you as soon as possible.",
  endCallFunctionEnabled: false,
  endCallMessage: "Thank you for reaching out to us. On behalf of Jackie, Have a great day!",
  transcriber: {
    model: "nova-2",
    keywords: [],
    language: "en",
    provider: "deepgram",
  },
  clientMessages: [
    "transcript",
    "hang",
    "function-call",
    "speech-update",
    "metadata",
    "conversation-update",
  ],
  serverMessages: [
    "end-of-call-report",
    "status-update",
    "hang",
    "function-call",
  ],
  dialKeypadFunctionEnabled: false,
  endCallPhrases: ["goodbye, bye"],
  hipaaEnabled: false,
  voicemailDetectionEnabled: false,
};
