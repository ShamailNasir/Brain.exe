import asyncio
import httpx
import time
import json
from config.settings import settings

async def test_model(model_name, payload_kwargs):
    print(f"\n--- Testing {model_name} ---")
    invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"
    
    headers = {
        "Authorization": f"Bearer {settings.NVIDIA_API_KEY}",
        "Accept": "text/event-stream"
    }

    payload = {
        "model": model_name,
        "messages": [{"role": "user", "content": "Explain quantum computing in exactly one short paragraph."}],
        "stream": True,
        **payload_kwargs
    }

    start_time = time.time()
    first_token_time = None
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            async with client.stream("POST", invoke_url, headers=headers, json=payload) as response:
                if response.status_code != 200:
                    error_text = await response.aread()
                    print(f"Error {response.status_code}: {error_text.decode('utf-8')}")
                    return
                
                async for line in response.aiter_lines():
                    if line.startswith("data: "):
                        data_str = line[len("data: "):].strip()
                        if data_str == "[DONE]":
                            continue
                        try:
                            data = json.loads(data_str)
                            if first_token_time is None:
                                first_token_time = time.time()
                            
                            delta = data["choices"][0].get("delta", {})
                            
                            # DeepSeek outputs reasoning here:
                            reasoning = delta.get("reasoning") or delta.get("reasoning_content")
                            if reasoning:
                                print(reasoning, end="", flush=True)
                                
                            content = delta.get("content")
                            if content:
                                print(content, end="", flush=True)
                        except json.JSONDecodeError:
                            pass
                            
        end_time = time.time()
        print(f"\n\n[Stats for {model_name}]")
        print(f"Time to first token (Responsiveness): {first_token_time - start_time:.2f}s" if first_token_time else "No response")
        print(f"Total time (Speed): {end_time - start_time:.2f}s")
        
    except Exception as e:
        import traceback
        print(f"Exception during test: {e}")
        traceback.print_exc()

async def run_tests():
    models_to_test = [
        (
            "moonshotai/kimi-k2.6", 
            {
                "max_tokens": 16384,
                "temperature": 1.00,
                "top_p": 1.00,
                "chat_template_kwargs": {"thinking": True}
            }
        ),
        (
            "qwen/qwen3.5-122b-a10b", 
            {
                "max_tokens": 16384,
                "temperature": 0.60,
                "top_p": 0.95,
                "chat_template_kwargs": {"enable_thinking": True}
            }
        ),
        (
            "deepseek-ai/deepseek-v4-flash", 
            {
                "max_tokens": 16384,
                "temperature": 1.00,
                "top_p": 0.95,
                "chat_template_kwargs": {"thinking": True, "reasoning_effort": "high"}
            }
        )
    ]
    
    for model_name, kwargs in models_to_test:
        await test_model(model_name, kwargs)

if __name__ == "__main__":
    asyncio.run(run_tests())
