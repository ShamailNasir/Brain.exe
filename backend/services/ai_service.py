import httpx
from config.settings import settings

class AIService:
    def __init__(self):
        self.google_api_key = settings.GOOGLE_API_KEY
        self.google_base_url = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}"
        
        self.nvidia_api_key = settings.NVIDIA_API_KEY
        self.nvidia_base_url = "https://integrate.api.nvidia.com/v1/chat/completions"

        # Model Definitions
        self.fast_nvidia = "meta/llama-3.1-8b-instruct"
        self.deep_nvidia = "meta/llama-3.3-70b-instruct"
        self.fallback_google = "gemini-2.5-flash"

    async def _call_nvidia(self, model: str, prompt: str, system_prompt: str = "") -> str:
        headers = {
            "Authorization": f"Bearer {self.nvidia_api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": 1024,
            "temperature": 0.5
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(self.nvidia_base_url, headers=headers, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _call_google(self, model: str, prompt: str, system_prompt: str = "") -> str:
        url = self.google_base_url.format(model=model, key=self.google_api_key)
        payload = {
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"temperature": 0.5}
        }
        if system_prompt:
            payload["systemInstruction"] = {"parts": [{"text": system_prompt}]}

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(url, headers={"Content-Type": "application/json"}, json=payload)
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    async def _run_fast(self, prompt: str, system_prompt: str = "") -> str:
        return await self._call_google(self.fallback_google, prompt, system_prompt)

    async def _run_deep(self, prompt: str, system_prompt: str = "") -> str:
        return await self._call_google(self.fallback_google, prompt, system_prompt)

    def _summarize_tasks(self, tasks: list) -> str:
        if not tasks: return "No tasks currently registered."
        return "\n".join(f"- {t.get('title')} ({t.get('type')}, {'Done' if t.get('completedDates') else 'Pending'})" for t in tasks)

    async def generate_future_message(self, data: dict) -> str:
        summary = self._summarize_tasks(data.get("tasks", []))
        sys_prompt = "You are the user's Future Self. Be emotionally intelligent and deeply motivational. Maximum 2 short sentences."
        prompt = f"Here is what I am working on right now:\n{summary}\nGive me a short message from my future self."
        res = await self._run_deep(prompt, sys_prompt)
        return res if res else "Keep pushing forward."

    async def enhance_task(self, title: str) -> str:
        sys_prompt = "Rewrite this task slightly to be more professional and clear. Return EXACTLY 1 short phrase. DO NOT add placeholders like [category] or [date]."
        res = await self._run_fast(f"Rewrite this seamlessly: {title}", sys_prompt)
        return res if res else title

    async def breakdown_task(self, title: str) -> str:
        sys_prompt = "Return exactly 3 highly specific, distinct bullet points. Always separate each item by pressing ENTER. Do not write them on a single line."
        res = await self._run_deep(f"Break down this task:\n{title}", sys_prompt)
        if res:
            res = res.replace(" - ", "\n- ").strip()
            return res
        return "- Network offline. Try again later."

    async def get_smart_suggestions(self, data: dict) -> str:
        summary = self._summarize_tasks(data.get("tasks", []))
        sys_prompt = "Suggest 1 logical next task based on the user's current list. Keep it extremely brief. Return ONLY the task title."
        prompt = f"Current tasks:\n{summary}\nSuggest what I should logically add next."
        return await self._run_fast(prompt, sys_prompt)

    async def get_quote(self) -> str:
        sys_prompt = "Provide a rare, powerful quote about discipline or productivity. Return ONLY the quote text natively. DO NOT include the author name. DO NOT include quotation marks or hyphens. Ensure perfect grammatical spacing."
        res = await self._run_deep("Give me a quote.", sys_prompt)
        return res if res else ""

    async def ask_help(self, query: str, data: dict, mode: str) -> str:
        summary = self._summarize_tasks(data.get("tasks", []))
        prompt = f"Context (My Tasks):\n{summary}\nMy question: {query}"
        sys_prompt = "You are an elite productivity coach. Be direct, practical, and highly concise."
        if mode == "fast":
            return await self._run_fast(prompt, sys_prompt)
        return await self._run_deep(prompt, sys_prompt)

    async def generate_boss_task(self, data: dict) -> dict:
        summary = self._summarize_tasks(data.get("tasks", []))
        stats = data.get("stats", {})
        level = stats.get("level", 1)
        
        sys_prompt = """You are an elite gamification AI for a productivity app.
Generate a 'Daily Boss Task' tailored to the user's current tasks and level.
The task should be slightly challenging but highly rewarding.
Return ONLY valid JSON with this exact schema:
{
  "title": "Short punchy title",
  "description": "1 sentence motivational description",
  "xpReward": integer between 50 and 200
}"""
        prompt = f"Context (My Tasks):\n{summary}\nMy Level: {level}\nGenerate today's Boss Task."
        res = await self._run_deep(prompt, sys_prompt)
        
        import json
        try:
            cleaned = res.replace("```json", "").replace("```", "").strip()
            task_data = json.loads(cleaned)
            return {
                "title": task_data.get("title", "Conquer the Day"),
                "description": task_data.get("description", "Complete 3 tasks to claim victory."),
                "xpReward": int(task_data.get("xpReward", 100))
            }
        except Exception:
            return {
                "title": "Clear Your Backlog",
                "description": "Finish at least 3 pending tasks today to maintain your streak.",
                "xpReward": 100
            }

    async def get_deep_feedback(self, data: dict) -> str:
        summary = self._summarize_tasks(data.get("tasks", []))
        notes = data.get("notes", [])
        notes_summary = ""
        if notes:
            notes_summary = "\nSaved Study Notes:\n" + "\n".join(f"- [{n.get('category', 'General')}] {n.get('title')}: {n.get('content', '')[:150]}..." for n in notes)
        else:
            notes_summary = "\nNo notes currently saved."
            
        sys_prompt = """You are an elite student performance and academic optimization coach.
Analyze the user's active tasks list and their recent class/study notes carefully.
Identify core study subjects, missing focus points, and practical revision techniques (like Active Recall questions, Spaced Repetition dates, or concepts breakdown).
Provide exactly 3 to 4 concise, action-driven, bulleted coaching directives. Make it highly engaging, practical, student-centric, and completely free of emojis or generic fluff."""
        
        prompt = f"Active Task Registry:\n{summary}\n{notes_summary}\n\nSynthesize my tasks and memory notebooks to generate today's study directives."
        return await self._run_deep(prompt, sys_prompt)

ai_service = AIService()

