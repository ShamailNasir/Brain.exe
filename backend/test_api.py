import asyncio
from services.ai_service import ai_service

async def run():
    print("Testing Gemini 2.5 Flash integration...")
    try:
        quote = await ai_service.get_quote()
        if quote:
            print("SUCCESS! Received quote:")
            print(f'"{quote}"')
        else:
            print("FAILED! No quote received.")
    except Exception as e:
        print(f"FAILED! Exception: {e}")

if __name__ == "__main__":
    asyncio.run(run())
