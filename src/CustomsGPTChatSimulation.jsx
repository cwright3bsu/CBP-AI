import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const profiles = [
  {
    name: "Tourist",
    scenario: "I'm here on vacation with my family for two weeks.",
    redFlags: [],
    required: ["purpose", "length", "accommodations"],
    keywords: {
      purpose: ["vacation", "holiday", "tourism", "visit", "leisure"],
      length: ["how long", "stay", "duration", "weeks", "days"],
      accommodations: ["where staying", "hotel", "accommodations", "lodging"]
    },
    responses: {
      purpose: "We're just here on holiday with the kids.",
      length: "We’re staying for two weeks.",
      accommodations: "We’ve booked a hotel downtown."
    }
  },
  {
    name: "Smuggler",
    scenario: "Just here for business, nothing special to declare.",
    redFlags: ["vague", "contraband"],
    required: ["goods", "bags", "purpose"],
    keywords: {
      purpose: ["business", "job", "work", "meeting"],
      goods: ["declare", "items", "goods", "products", "samples"],
      bags: ["bag", "luggage", "suitcase", "carry-on"]
    },
    responses: {
      purpose: "Business meetings. That’s all.",
      goods: "Some samples maybe, nothing important.",
      bags: "Just a small bag with essentials."
    }
  },
  {
    name: "Visa Issue",
    scenario: "I'm visiting a friend, not sure how long I'll stay.",
    redFlags: ["no return ticket"],
    required: ["visa", "return", "intent"],
    keywords: {
      visa: ["visa", "entry document", "permit"],
      return: ["return", "leaving", "flight back", "ticket"],
      intent: ["how long", "plans", "duration", "stay"]
    },
    responses: {
      visa: "I think I might need one? Not sure honestly.",
      return: "I haven’t booked a return flight yet.",
      intent: "I’ll stay as long as it’s okay with my friend."
    }
  },
  {
    name: "Agriculture Risk",
    scenario: "I brought some fruits and homemade snacks from home.",
    redFlags: ["agricultural", "food"],
    required: ["agriculture", "bringing", "snacks"],
    keywords: {
      agriculture: ["plants", "dirt", "agriculture", "livestock"],
      bringing: ["carrying", "bringing", "import", "transport"],
      snacks: ["fruit", "snacks", "mango", "cookies", "food"]
    },
    responses: {
      agriculture: "Just fruits and some homemade items.",
      bringing: "Yeah, I brought a few things from home.",
      snacks: "Mangoes, cookies, and some dried stuff."
    }
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

  const handleSend = (e) => {
    e?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed) return;

    const newChat = [...chat, { id: uuidv4(), sender: "student", text: trimmed }];
    setChat(newChat);
    setInput("");

    const reply = generateTravelerReply(trimmed.toLowerCase());
    const updatedChat = [...newChat, { id: uuidv4(), sender: "traveler", text: reply }];
    setChat(updatedChat);

    const newAsked = [...asked];
    for (const key of profile.required) {
      const triggers = profile.keywords?.[key] || [];
      if (triggers.some(trigger => trimmed.includes(trigger)) && !newAsked.includes(key)) {
        newAsked.push(key);
      }
    }

    if (newAsked.length >= 3 || updatedChat.filter(m => m.sender === "student").length >= 6) {
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

  function generateTravelerReply(input) {
    for (const key of profile.required) {
      const triggers = profile.keywords?.[key] || [];
      if (triggers.some(trigger => input.includes(trigger))) {
        return profile.responses?.[key] || "That's a good question.";
      }
    }
    return "I'm not sure what you mean. Could you rephrase it?";
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
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            className="border p-2 flex-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask a question..."
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >Send</button>
        </form>
      )}
    </div>
  );
}
