import { useEffect, useRef, useState } from "react";

import { FaUserCircle } from "react-icons/fa";

import ReactMarkdown from "react-markdown";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "./firebase";

function App() {

  // Chat states
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! Upload PDFs or ask me anything 🚀",
    },
  ]);

  // User menu
  const [showMenu, setShowMenu] =
    useState(false);

  // Auth states
  const [user, setUser] = useState(null);

  const [showLogin, setShowLogin] =
    useState(false);

  const [showSignup, setShowSignup] =
    useState(false);

  const [email, setEmail] = useState("");

  const [password, setPassword] =
    useState("");

  // Auto scroll
  const messagesEndRef = useRef(null);

  useEffect(() => {

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });

  }, [messages]);

  // Firebase auth listener
  useEffect(() => {

    const unsubscribe =
      onAuthStateChanged(
        auth,
        (currentUser) => {
          setUser(currentUser);
        }
      );

    return () => unsubscribe();

  }, []);

  // Send Message
  const sendMessage = async () => {

    if (message.trim() === "") return;

    const currentMessage = message;

    // Add user message
    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        content: currentMessage,
      },
    ]);

    setMessage("");

    setLoading(true);

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message: currentMessage,
          }),
        }
      );

      const data = await res.json();

      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.response ||
            data.error,
        },
      ]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Something went wrong",
        },
      ]);
    }

    setLoading(false);
  };

  // PDF Upload
  const handlePDFUpload = async (e) => {

    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();

    formData.append("file", file);

    try {

      const res = await fetch(
        "http://127.0.0.1:8000/upload-pdf",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            `✅ PDF uploaded successfully\n\nCharacters extracted: ${data.characters}`,
        },
      ]);

    } catch (error) {

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "❌ PDF upload failed",
        },
      ]);
    }
  };

  return (

    <div className="flex h-screen bg-slate-900 text-white">

      {/* Sidebar */}
      <div className="w-64 bg-slate-800 p-5 border-r border-slate-700">

        <h1 className="text-2xl font-bold mb-6">
          AI Assistant
        </h1>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg"
        >
          + New Chat
        </button>

      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div
          className="p-4 border-b border-slate-700 flex justify-between items-center"
        >

          <h2 className="text-xl font-semibold">
            AI Chat
          </h2>

          {/* User Menu */}
          <div className="relative">

            <button
              onClick={() =>
                setShowMenu(!showMenu)
              }
            >
              <FaUserCircle size={35} />
            </button>

            {/* Dropdown */}
            {showMenu && (

              <div
                className="absolute right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg w-44 p-2 z-50"
              >

                {!user ? (
                  <>

                    <button
                      className="w-full text-left p-2 hover:bg-slate-700 rounded"
                      onClick={() => {

                        setShowLogin(true);

                        setShowMenu(false);
                      }}
                    >
                      Login
                    </button>

                    <button
                      className="w-full text-left p-2 hover:bg-slate-700 rounded"
                      onClick={() => {

                        setShowSignup(true);

                        setShowMenu(false);
                      }}
                    >
                      Signup
                    </button>

                  </>
                ) : (
                  <>

                    <div className="p-2 text-sm text-slate-300">
                      👋 {user?.email}
                    </div>

                    <button
                      className="w-full text-left p-2 hover:bg-slate-700 rounded"
                      onClick={async () => {

                        await signOut(auth);

                        setShowMenu(false);
                      }}
                    >
                      Logout
                    </button>

                  </>
                )}

              </div>

            )}

          </div>

        </div>

        {/* Messages */}
        <div
          className="flex-1 overflow-y-auto p-6 space-y-4"
        >

          {messages.map((msg, index) => (

            <div
              key={index}
              className={`flex ${
                msg.role === "user"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >

              <div
                className={`max-w-2xl p-4 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600"
                    : "bg-slate-800"
                }`}
              >

                <ReactMarkdown>
                  {msg.content}
                </ReactMarkdown>

              </div>

            </div>

          ))}

          {/* Loading */}
          {loading && (

            <div className="flex justify-start">

              <div
                className="bg-slate-800 p-4 rounded-2xl"
              >
                Thinking...
              </div>

            </div>

          )}

          <div ref={messagesEndRef} />

        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-700">

          {/* PDF Upload */}
          <div className="mb-3">

            <input
              type="file"
              accept=".pdf"
              onChange={handlePDFUpload}
              className="text-sm"
            />

          </div>

          {/* Input + Button */}
          <div className="flex gap-3">

            <input
              type="text"
              value={message}
              disabled={loading}
              placeholder="Ask anything..."
              onChange={(e) =>
                setMessage(e.target.value)
              }
              onKeyDown={(e) => {

                if (e.key === "Enter") {
                  sendMessage();
                }
              }}
              className="flex-1 p-4 rounded-xl bg-slate-800 border border-slate-700 outline-none"
            />

            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 px-6 rounded-xl"
            >
              {loading ? "..." : "Send"}
            </button>

          </div>

        </div>

      </div>

      {/* Login Modal */}
      {showLogin && (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-slate-800 p-6 rounded-2xl w-96">

            <h2 className="text-2xl mb-4 font-bold">
              Login
            </h2>

            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-slate-700 mb-4 outline-none"
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-slate-700 mb-4 outline-none"
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg"
              onClick={async () => {

                try {

                  await signInWithEmailAndPassword(
                    auth,
                    email,
                    password
                  );

                  setShowLogin(false);

                } catch (error) {

                  alert(error.message);
                }
              }}
            >
              Login
            </button>

            <button
              className="w-full mt-3 bg-slate-700 p-3 rounded-lg"
              onClick={() =>
                setShowLogin(false)
              }
            >
              Cancel
            </button>

          </div>

        </div>

      )}

      {/* Signup Modal */}
      {showSignup && (

        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">

          <div className="bg-slate-800 p-6 rounded-2xl w-96">

            <h2 className="text-2xl mb-4 font-bold">
              Signup
            </h2>

            <input
              type="email"
              placeholder="Email"
              className="w-full p-3 rounded-lg bg-slate-700 mb-4 outline-none"
              onChange={(e) =>
                setEmail(e.target.value)
              }
            />

            <input
              type="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-slate-700 mb-4 outline-none"
              onChange={(e) =>
                setPassword(e.target.value)
              }
            />

            <button
              className="w-full bg-green-600 hover:bg-green-700 p-3 rounded-lg"
              onClick={async () => {

                try {

                  await createUserWithEmailAndPassword(
                    auth,
                    email,
                    password
                  );

                  setShowSignup(false);

                } catch (error) {

                  alert(error.message);
                }
              }}
            >
              Create Account
            </button>

            <button
              className="w-full mt-3 bg-slate-700 p-3 rounded-lg"
              onClick={() =>
                setShowSignup(false)
              }
            >
              Cancel
            </button>

          </div>

        </div>

      )}

    </div>
  );
}

export default App;