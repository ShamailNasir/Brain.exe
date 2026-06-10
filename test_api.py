import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

import asyncio
from services.ai_service import ai_service

async def test():
    print("Testing OpenRouter (Fast)...")
    res1 = await ai_service._run_fast("Say hi")
    print(f"Fast Result: {res1}")
    
    print("Testing Nvidia (Deep)...")
    res2 = await ai_service._run_deep("Say hi")
    print(f"Deep Result: {res2}")

if __name__ == "__main__":
    asyncio.run(test())
