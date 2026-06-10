from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from services.ai_service import ai_service

router = APIRouter(prefix="/ai", tags=["AI"])

class ContextRequest(BaseModel):
    tasks: List[Dict[str, Any]] = []
    stats: Dict[str, Any] = {}
    notes: List[Dict[str, Any]] = []

class TaskStringRequest(BaseModel):
    title: str

class HelpRequest(BaseModel):
    query: str
    tasks: List[Dict[str, Any]] = []
    mode: str = "fast"

@router.post("/future-message")
async def future_message(req: ContextRequest):
    res = await ai_service.generate_future_message(req.dict())
    return {"message": res}

@router.post("/enhance-task")
async def enhance_task(req: TaskStringRequest):
    res = await ai_service.enhance_task(req.title)
    return {"enhanced": res.replace('"', '').strip()}

@router.post("/breakdown")
async def breakdown_task(req: TaskStringRequest):
    res = await ai_service.breakdown_task(req.title)
    return {"breakdown": res}

@router.post("/smart-suggestions")
async def smart_suggestions(req: ContextRequest):
    res = await ai_service.get_smart_suggestions(req.dict())
    return {"suggestions": res}

@router.post("/suggestions")
async def suggestions(req: ContextRequest):
    res = await ai_service.get_deep_feedback(req.dict())
    return {"feedback": res}

@router.post("/quote")
async def get_quote():
    res = await ai_service.get_quote()
    return {"quote": res}

@router.post("/help")
async def ask_help(req: HelpRequest):
    res = await ai_service.ask_help(req.query, req.dict(), req.mode)
    return {"response": res}

@router.post("/boss-task")
async def boss_task(req: ContextRequest):
    res = await ai_service.generate_boss_task(req.dict())
    return res
