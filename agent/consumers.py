import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .agent_service import run_agent

class AgentConsumer(AsyncWebsocketConsumer):
    
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
        await self.accept()
        await self.send(text_data=json.dumps({
            'type': 'connected',
            'message': 'Connected to AgentOS'
        }))

    async def disconnect(self, close_code):
        pass

    async def receive(self, text_data):
        data = json.loads(text_data)
        goal = data.get('goal', '').strip()

        if not goal:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Please enter a goal'
            }))
            return

        await self.send(text_data=json.dumps({
            'type': 'thinking',
            'message': f'Starting research on: {goal}'
        }))

        async for update in run_agent(goal, self.send_update):
            pass

    async def send_update(self, update_type, message):
        await self.send(text_data=json.dumps({
            'type': update_type,
            'message': message
        }))