# PinnacleBot 🤖 — Simple Python Chatbot

A rule-based chatbot built for the Pinnacle Lab Data Science internship project.

---

## Files
| File | Purpose |
|------|---------|
| `chatbot.py` | Core chatbot logic (patterns + responses) |
| `app.py` | Flask web app (optional web UI version) |

---

## Option 1 — Run in Terminal (Beginner Friendly)

### Requirements
- Python 3.7 or above (no extra libraries needed!)

### Steps
```bash
# 1. Open terminal / command prompt
# 2. Navigate to your project folder
cd path/to/your/folder

# 3. Run the chatbot
python chatbot.py
```

You'll see:
```
==================================================
   Welcome to PinnacleBot 🤖
   Type 'quit' or 'bye' to exit
==================================================

You: hello
Bot: Hello! 👋 I'm PinnacleBot. How can I help you today?
```

---

## Option 2 — Run as a Web App (Flask)

### Requirements
```bash
pip install flask
```

### Steps
```bash
# Both files (chatbot.py and app.py) must be in the same folder

python app.py
```

Then open your browser and go to: **http://localhost:5000**

---

## What the Bot Can Do

| You say...         | Bot responds with...           |
|--------------------|-------------------------------|
| hello / hi         | Greeting                      |
| what's your name   | Bot identity                  |
| help               | List of features              |
| what time is it    | Current time                  |
| what's today's date| Current date                  |
| tell me a joke     | A funny joke                  |
| tell me a fact     | An interesting fun fact       |
| give me a quote    | A motivational quote          |
| bye / quit         | Farewell and exits            |

---

## Showcase Tips
- Run the terminal version to show the logic directly
- Run the Flask version for a polished web demo
- Show the `chatbot.py` code to explain pattern matching with `re` module
- Mention this can be extended with ML (spaCy, transformers) as next steps

---

Built with ❤️ at Pinnacle Lab | Python 3 | No external ML libraries required
