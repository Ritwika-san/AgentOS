import asyncio
from django.conf import settings
from langchain_groq import ChatGroq
from langchain_core.tools import tool
from langchain_core.messages import HumanMessage, SystemMessage, ToolMessage
from tavily import TavilyClient


def get_tavily_client():
    return TavilyClient(api_key=settings.TAVILY_API_KEY)


@tool
def web_search(query: str) -> str:
    """Search the web for current information about a topic."""
    try:
        client = get_tavily_client()
        results = client.search(query, max_results=3)
        output = ""
        for r in results['results']:
            output += f"Title: {r['title']}\n"
            output += f"Content: {r['content']}\n\n"
        return output if output else "No results found"
    except Exception as e:
        return f"Search failed: {str(e)}"


@tool
def calculator(expression: str) -> str:
    """Calculate a mathematical expression. Input should be a valid math expression like '2 + 2'."""
    try:
        result = eval(expression)
        return str(result)
    except Exception as e:
        return f"Calculation failed: {str(e)}"


async def run_agent(goal: str, send_update):
    await send_update('thinking', 'Setting up AI agent...')

    try:
        llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model="llama-3.1-8b-instant",
            temperature=0.7
        )

        tools = [web_search, calculator]
        llm_with_tools = llm.bind_tools(tools)

        await send_update('thinking', 'Agent is analyzing your goal...')

        messages = [
            SystemMessage(content="""You are a helpful research assistant with access to web search and calculator tools.

When given a goal:
1. Break it down into steps
2. Use web_search to find information
3. Use calculator for any math
4. Synthesize everything into a clear response

Always use tools to find current information rather than relying on your training data."""),
            HumanMessage(content=goal)
        ]

        await send_update('thinking', 'Searching and analyzing...')

        response = await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: llm_with_tools.invoke(messages)
        )

        if response.tool_calls:
            for tool_call in response.tool_calls:
                tool_name = tool_call['name']
                tool_args = tool_call['args']

                await send_update('thinking', f'Using tool: {tool_name}...')

                if tool_name == 'web_search':
                    tool_result = web_search.invoke(tool_args)
                elif tool_name == 'calculator':
                    tool_result = calculator.invoke(tool_args)
                else:
                    tool_result = "Tool not found"

                await send_update('thinking', f'Got results from {tool_name}')

                messages.append(response)
                messages.append(ToolMessage(
                    content=str(tool_result),
                    tool_call_id=tool_call['id']
                ))

            await send_update('thinking', 'Writing final response...')

            final_response = await asyncio.get_event_loop().run_in_executor(
                None,
                lambda: llm_with_tools.invoke(messages)
            )
            result = final_response.content
        else:
            result = response.content

        await send_update('result', result)
        yield result

    except Exception as e:
        await send_update('error', f'Agent error: {str(e)}')
        yield str(e)