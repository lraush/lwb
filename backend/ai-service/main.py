from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import openai
import os
import base64
import tempfile
import httpx
from datetime import datetime

app = FastAPI(title="LWB AI Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── OpenAI client ─────────────────────────────
openai_client = openai.AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))

SYSTEM_PROMPT = """Ты — персональный ИИ-ассистент платформы lifeWorkBalances.
Ты помогаешь пользователю управлять работой, учёбой и личной жизнью.

Твои возможности:
• Планирование задач и рабочего дня
• Создание учебных роадмапов и планов
• Финансовые советы и анализ
• Советы по здоровью, спорту и привычкам
• Поиск и анализ информации
• Анализ экрана и помощь в реальном времени

Отвечай по-русски, лаконично и по делу. Используй эмодзи умеренно.
Форматируй длинные ответы с помощью структуры (списки, заголовки)."""

# ── Models ─────────────────────────────────────
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    context: Optional[dict] = {}

class ScreenRequest(BaseModel):
    image: str  # base64 JPEG

class PDFRequest(BaseModel):
    title: str
    messages: List[ChatMessage]

# ── POST /chat ────────────────────────────────
@app.post("/chat")
async def chat(req: ChatRequest):
    if not openai_client.api_key:
        # Demo mode without API key
        return {"response": _demo_response(req.message)}

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    for m in (req.history or [])[-10:]:
        messages.append({"role": m.role, "content": m.content})
    messages.append({"role": "user", "content": req.message})

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=1500,
            temperature=0.7,
        )
        return {"response": resp.choices[0].message.content}
    except openai.AuthenticationError:
        raise HTTPException(status_code=401, detail="Неверный OpenAI API ключ")
    except openai.RateLimitError:
        raise HTTPException(status_code=429, detail="Превышен лимит запросов OpenAI")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── POST /transcribe ──────────────────────────
@app.post("/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    if not openai_client.api_key:
        return {"text": "Голосовое распознавание требует OpenAI API ключ"}

    content = await audio.read()
    with tempfile.NamedTemporaryFile(suffix=".webm", delete=False) as f:
        f.write(content)
        fname = f.name

    try:
        with open(fname, "rb") as af:
            transcript = await openai_client.audio.transcriptions.create(
                model="whisper-1",
                file=af,
                language="ru",
            )
        return {"text": transcript.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка транскрипции: {e}")
    finally:
        os.unlink(fname)

# ── POST /analyze-screen ──────────────────────
@app.post("/analyze-screen")
async def analyze_screen(req: ScreenRequest):
    if not openai_client.api_key:
        return {"analysis": "Анализ экрана требует OpenAI API ключ с поддержкой GPT-4 Vision"}

    # Strip data URL prefix if present
    image_data = req.image
    if "base64," in image_data:
        image_data = image_data.split("base64,")[1]

    try:
        resp = await openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:image/jpeg;base64,{image_data}", "detail": "high"},
                    },
                    {
                        "type": "text",
                        "text": "Проанализируй этот скриншот экрана. Опиши что происходит, какие задачи выполняются, и дай полезные советы или следующие шаги. Отвечай по-русски.",
                    },
                ],
            }],
            max_tokens=1000,
        )
        return {"analysis": resp.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── POST /generate-pdf ────────────────────────
@app.post("/generate-pdf")
async def generate_pdf(req: PDFRequest):
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import mm
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
        from reportlab.lib import colors
        import io

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=20*mm, bottomMargin=20*mm)
        styles = getSampleStyleSheet()
        story = []

        title_style = ParagraphStyle('title', parent=styles['Title'], fontSize=18, textColor=colors.HexColor('#7c6af7'))
        story.append(Paragraph(req.title, title_style))
        story.append(Paragraph(f"Дата: {datetime.now().strftime('%d.%m.%Y %H:%M')}", styles['Normal']))
        story.append(Spacer(1, 12))

        for msg in req.messages:
            role_label = "👤 Пользователь" if msg.role == "user" else "🤖 ИИ-Ассистент"
            story.append(Paragraph(f"<b>{role_label}:</b>", styles['Normal']))
            story.append(Paragraph(msg.content.replace('\n', '<br/>'), styles['Normal']))
            story.append(Spacer(1, 8))

        doc.build(story)
        buf.seek(0)

        from fastapi.responses import Response
        return Response(content=buf.read(), media_type="application/pdf",
                       headers={"Content-Disposition": "attachment; filename=ai-session.pdf"})
    except ImportError:
        raise HTTPException(status_code=500, detail="reportlab не установлен")

# ── Demo responses (no API key) ───────────────
def _demo_response(message: str) -> str:
    msg = message.lower()
    if any(w in msg for w in ['план', 'день', 'today']):
        return """📋 **План дня:**

🌅 Утро (9:00–12:00)
• Разбор почты и задач
• Фокус-блок: приоритетная задача
• Stand-up с командой

☀️ День (12:00–17:00)
• Обед + прогулка 20 мин
• Работа над проектом
• Ревью PR / документация

🌆 Вечер (17:00–20:00)
• Учёба / курсы (30–60 мин)
• Тренировка или прогулка
• Планирование на завтра

💡 Совет: начни с самой сложной задачи — это принцип «лягушки»."""
    if any(w in msg for w in ['финанс', 'деньг', 'экономи']):
        return """💰 **Финансовые советы:**

1. **Правило 50/30/20**: 50% — нужды, 30% — желания, 20% — накопления
2. **Экстренный фонд**: накопи 3–6 месячных расходов
3. **Автоматизация**: настрой автоперевод на сберегательный счёт в день зарплаты
4. **Отслеживание**: записывай все расходы (уже делаешь через приложение!)
5. **Инвестиции**: начни с индексных фондов после создания подушки безопасности"""
    if any(w in msg for w in ['python', 'програм', 'код', 'учёба']):
        return """📚 **Учебный план Python (3 месяца):**

**Месяц 1 — Основы**
• Переменные, типы, условия, циклы
• Функции, аргументы, return
• Списки, словари, кортежи

**Месяц 2 — Средний уровень**
• ООП: классы, наследование
• Работа с файлами и API
• Библиотеки: requests, json

**Месяц 3 — Практика**
• Проект: телеграм-бот или веб-парсер
• Git и GitHub
• Введение в FastAPI или Django

📖 Ресурсы: Python.org, Automate the Boring Stuff (бесплатно), replit.com"""
    return f"""🤖 Понял ваш запрос: *«{message}»*

Я готов помочь с:
• 📋 Планированием задач и дня
• 💰 Финансовым анализом  
• 📚 Учебными планами
• 🏃 Спортивными программами
• 🧠 Мозговым штурмом

Уточните запрос или добавьте OpenAI API ключ для полного функционала."""

# ── Health ─────────────────────────────────────
@app.get("/health")
async def health():
    return {"status": "ok", "service": "ai", "has_openai_key": bool(os.getenv("OPENAI_API_KEY"))}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", 8000)))
