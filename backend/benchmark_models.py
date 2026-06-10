import asyncio
import time
import json
import httpx
from config.settings import settings

API_KEYS = {
    "openrouter": settings.OPENROUTER_API_KEY,
    "nvidia": settings.NVIDIA_API_KEY,
    "google": settings.GOOGLE_API_KEY
}

ENDPOINTS = {
    "openrouter": "https://openrouter.ai/api/v1/chat/completions",
    "nvidia": "https://integrate.api.nvidia.com/v1/chat/completions",
    "google": "https://generativelanguage.googleapis.com/v1beta/models/{model}:streamGenerateContent?key={key}"
}

MODELS = [
    # Google Direct
    {"provider": "google", "id": "gemini-2.5-flash"},
    
    # OpenRouter
    {"provider": "openrouter", "id": "liquid/lfm-2.5-1.2b-instruct:free"},
    {"provider": "openrouter", "id": "meta-llama/llama-3.2-3b-instruct"},
    {"provider": "openrouter", "id": "google/gemini-2.5-flash"},

    # Nvidia Fast Models
    {"provider": "nvidia", "id": "meta/llama-3.1-8b-instruct"},
    {"provider": "nvidia", "id": "meta/llama-3.2-3b-instruct"},
    {"provider": "nvidia", "id": "meta/llama-3.3-70b-instruct"},
    {"provider": "nvidia", "id": "nvidia/llama-3.1-nemotron-70b-instruct"},
    {"provider": "nvidia", "id": "deepseek-ai/deepseek-v4-flash"},
]

PROMPT = "Write exactly one short sentence about productivity."

async def test_openai_compatible(client, provider, model_id):
    url = ENDPOINTS[provider]
    headers = {
        "Authorization": f"Bearer {API_KEYS[provider]}",
        "Accept": "text/event-stream"
    }
    payload = {
        "model": model_id,
        "messages": [{"role": "user", "content": PROMPT}],
        "stream": True,
        "max_tokens": 50,
        "temperature": 0.5
    }
    
    start = time.time()
    ttft = None
    try:
        async with client.stream("POST", url, headers=headers, json=payload, timeout=15.0) as response:
            if response.status_code != 200:
                return {"error": f"HTTP {response.status_code}"}
            
            async for line in response.aiter_lines():
                if line.startswith("data: ") and line != "data: [DONE]":
                    if ttft is None:
                        ttft = time.time() - start
                    # Stop reading early to simulate actual generation speed vs TTFT? 
                    # No, read full output to measure total speed.
        end = time.time() - start
        return {"ttft": ttft, "total": end}
    except Exception as e:
        return {"error": str(e)}

async def test_google_direct(client, model_id):
    url = ENDPOINTS["google"].format(model=model_id, key=API_KEYS["google"])
    payload = {
        "contents": [{"role": "user", "parts": [{"text": PROMPT}]}],
    }
    headers = {"Content-Type": "application/json"}
    
    start = time.time()
    ttft = None
    try:
        # Google uses SSE for streaming via streamGenerateContent
        async with client.stream("POST", url, headers=headers, json=payload, timeout=15.0) as response:
            if response.status_code != 200:
                return {"error": f"HTTP {response.status_code}"}
            
            async for line in response.aiter_lines():
                if line.startswith("data: "):
                    if ttft is None:
                        ttft = time.time() - start
        end = time.time() - start
        return {"ttft": ttft, "total": end}
    except Exception as e:
        return {"error": str(e)}

async def main():
    print("Provider | Model | TTFT (s) | Total (s) | Status")
    print("-" * 70)
    
    async with httpx.AsyncClient() as client:
        for model in MODELS:
            provider = model["provider"]
            model_id = model["id"]
            
            if provider == "google":
                res = await test_google_direct(client, model_id)
            else:
                res = await test_openai_compatible(client, provider, model_id)
                
            if "error" in res:
                print(f"{provider:10} | {model_id:40} | ERROR | ERROR | {res['error']}")
            else:
                ttft = res["ttft"] or 0
                total = res["total"] or 0
                print(f"{provider:10} | {model_id:40} | {ttft:.3f} | {total:.3f} | OK")

if __name__ == "__main__":
    asyncio.run(main())
