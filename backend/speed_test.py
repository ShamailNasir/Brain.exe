import asyncio
import httpx
import time
from config.settings import settings

async def test_or_speed(model):
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }
    start = time.time()
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json={"model": model, "messages": [{"role": "user", "content": "Say hi"}]})
            if res.status_code == 200: 
                duration = time.time() - start
                print(f"[OK] {model}: {duration:.2f}s")
                return duration
            else:
                print(f"[FAIL] {model}: Failed ({res.status_code})")
                return 999
    except Exception as e:
        print(f"[FAIL] {model}: Failed ({e})")
        return 999

async def run():
    models = [
        "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
        "openrouter/free",
        "google/gemma-2-9b-it:free",
        "huggingfaceh4/zephyr-7b-beta:free",
        "meta-llama/llama-3.2-3b-instruct:free",
        "meta-llama/llama-3.1-8b-instruct:free",
        "meta-llama/llama-3.3-70b-instruct:free",
        "nvidia/nemotron-3-nano-9b-v2:free",
        "nvidia/nemotron-3-super-120b-a12b:free",
        "qwen/qwen-2-7b-instruct:free",
        "qwen/qwen3-coder:free",
        "z-ai/glm-4.5-air:free",
        "liquid/lfm-2.5-1.2b-instruct:free"
    ]
    results = []
    for m in models:
        dur = await test_or_speed(m)
        if dur < 999:
            results.append((dur, m))
    
    results.sort(key=lambda x: x[0])
    print("\n--- Top Fastest Working Models ---")
    for d, m in results:
        print(f"{m}: {d:.2f}s")

if __name__ == "__main__":
    asyncio.run(run())
