import asyncio
import httpx

async def get_free_models():
    async with httpx.AsyncClient() as client:
        res = await client.get("https://openrouter.ai/api/v1/models")
        data = res.json()
        free_models = [m["id"] for m in data.get("data", []) if ":free" in m["id"] or ("pricing" in m and m["pricing"].get("prompt") == "0" and m["pricing"].get("completion") == "0")]
        print(free_models)

if __name__ == "__main__":
    asyncio.run(get_free_models())
