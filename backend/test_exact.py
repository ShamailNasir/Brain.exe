import requests
import time

API_KEY = "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"
invoke_url = "https://integrate.api.nvidia.com/v1/chat/completions"

def test_model(name, payload_kwargs):
    print(f"\n=============================")
    print(f"Testing {name}...")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Accept": "text/event-stream"
    }

    payload = {
        "model": name,
        "messages": [{"role": "user", "content": "Explain quantum computing in one short paragraph."}],
        "stream": True,
        **payload_kwargs
    }

    start = time.time()
    first_token = None
    
    try:
        response = requests.post(invoke_url, headers=headers, json=payload, stream=True, timeout=120)
        
        if response.status_code != 200:
            print(f"Error {response.status_code}: {response.text}")
            return
            
        for line in response.iter_lines():
            if line:
                if first_token is None:
                    first_token = time.time()
                line_str = line.decode("utf-8")
                if line_str.startswith("data: ") and line_str != "data: [DONE]":
                    import json
                    try:
                        data = json.loads(line_str[6:])
                        delta = data["choices"][0].get("delta", {})
                        content = delta.get("content") or ""
                        reasoning = delta.get("reasoning") or delta.get("reasoning_content") or ""
                        print(reasoning + content, end="", flush=True)
                    except Exception:
                        pass
        end = time.time()
        print(f"\n\n[Results for {name}]")
        if first_token:
            print(f"Responsiveness (TTFT): {first_token - start:.2f}s")
        print(f"Total Speed: {end - start:.2f}s")
        
    except Exception as e:
        print(f"\nFailed to test {name}: {e}")

if __name__ == "__main__":
    test_model("moonshotai/kimi-k2.6", {
        "max_tokens": 16384,
        "temperature": 1.00,
        "top_p": 1.00,
        "chat_template_kwargs": {"thinking": True}
    })
    
    test_model("qwen/qwen3.5-122b-a10b", {
        "max_tokens": 16384,
        "temperature": 0.60,
        "top_p": 0.95,
        "chat_template_kwargs": {"enable_thinking": True}
    })
    
    test_model("deepseek-ai/deepseek-v4-flash", {
        "max_tokens": 16384,
        "temperature": 1.00,
        "top_p": 0.95,
        "chat_template_kwargs": {"thinking": True, "reasoning_effort": "high"}
    })
