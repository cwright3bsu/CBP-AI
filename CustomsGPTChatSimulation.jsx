import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const profiles = [
  {
    name: "Tourist",
    scenario: "I'm here on vacation with my family for two weeks.",
    redFlags: [],
    required: ["purpose", "length", "accommodations"],
  },
  {
    name: "Smuggler",
    scenario: "Just here for business, nothing special to declare.",
    redFlags: ["vague", "contraband"],
    required: ["goods", "bags", "purpose"],
  },
  {
    name: "Visa Issue",
    scenario: "I'm visiting a friend, not sure how long I'll stay.",
    redFlags: ["no return ticket"],
    required: ["visa", "return", "intent"],
  },
  {
    name: "Agriculture Risk",
    scenario: "I brought some fruits and homemade snacks from home.",
    redFlags: ["agricultural", "food"],
    required: ["agriculture", "bringing", "snacks"],
  }
];

export default function GPTChatSimulation() {
  const [profileIndex, setProfileIndex] = useState(0);
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [asked, setAsked] = useState([]);
  const [scoreHistory, setScoreHistory] = useState([]);
  const [done, setDone] = useState(false);

  const profile = profiles[profileIndex];

  useEffect(() => {
    setChat([{ id: uuidv4(), sender: "traveler", text: profile.scenario }]);
    setAsked([]);
  }, [profileIndex]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newChat = [...chat, { id: uuidv4(), sender: "student", text: trimmed }];
    setChat(newChat);
    setInput("");

    const reply = await generateTravelerReply(trimmed.toLowerCase());
    const updatedChat = [...newChat, { id: uuidv4(), sender: "traveler", text: reply }];
    setChat(updatedChat);

    const matched = profile.required.filter(req => trimmed.includes(req));
    const newAsked = [...new Set([...asked, ...matched])];

    if (newAsked.length >= 5 || updatedChat.filter(m => m.sender === "student").length >= 6) {
      const redFlagHits = profile.redFlags.filter(flag => trimmed.includes(flag));
      const scoreTotal = newAsked.length * 10 + redFlagHits.length * 15;
      const feedback = [
        `✅ Asked: ${newAsked.join(", ") || "None"}`,
        redFlagHits.length ? `🚩 Red Flags Caught: ${redFlagHits.join(", ")}` : "⚠️ Missed red flags."
      ];

      const newScore = { profile: profile.name, score: scoreTotal, feedback };
      setScoreHistory([...scoreHistory, newScore]);

      if (profileIndex + 1 < profiles.length) {
        setTimeout(() => {
          setProfileIndex(profileIndex + 1);
        }, 1000);
      } else {
        setDone(true);
      }
    }

    setAsked(newAsked);
  };

  async function generateTravelerReply(input) {
    if (input.includes("purpose")) return "Just here to relax really.";
    if (input.includes("visa")) return "I think I have a visa... maybe?";
    if (input.includes("return")) return "I haven't booked a return ticket yet.";
    if (input.includes("food") || input.includes("fruit")) return "Yes, some fruits and snacks.";
    if (input.includes("work")) return "I might look for something part-time, who knows.";
    return "Hmm... I’m not sure what you mean.";
  }

  return (
    <div className="max-w-2xl mx-auto p-4 font-sans">
      <h1 className="text-xl font-bold mb-2">Customs Officer GPT Chat Simulation</h1>

      {!done && (
        <div className="border rounded p-2 h-96 overflow-y-auto bg-gray-50 mb-2">
          {chat.map(entry => (
            <div key={entry.id} className={`mb-1 ${entry.sender === "student" ? "text-blue-700" : "text-black"}`}>
              <strong>{entry.sender === "student" ? "You" : "Traveler"}:</strong> {entry.text}
            </div>
          ))}
        </div>
      )}

      {done ? (
        <div className="p-4 bg-green-100 rounded">
          <h2 className="font-semibold mb-2">Final Evaluation</h2>
          {scoreHistory.map((s, i) => (
            <div key={i} className="mb-3">
              <p className="font-medium">Traveler: {s.profile}</p>
              <p>Score: {s.score} / 100</p>
              <ul className="list-disc list-inside">
                {s.feedback.map((line, idx) => <li key={idx}>{line}</li>)}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            className="border p-2 flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
          />
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleSend}
          >Send</button>
        </div>
      )}
    </div>
  );
}