import { TavilySearchResults } from '@langchain/community/tools/tavily_search';
import { ChatOpenAI } from 'langchain/chat_models/openai';
import { ChatMessageHistory } from 'langchain/stores/message/in_memory';
import {
	HumanMessage,
	AIMessage,
	SystemMessage,
} from '@langchain/core/messages';
import { config } from './config.js';
import {
	ChatPromptTemplate,
	MessagesPlaceholder,
} from '@langchain/core/prompts';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';

interface Completion {
	Content: string | null;
	Error?: string | undefined;
	TokenUsage: number | undefined;
}

interface ConnectorResponse {
	Completions: Completion[];
	ModelType: string;
}

interface ErrorCompletion {
	choices: Array<{
		message: {
			content: string;
		};
	}>;
	error: string;
	model: string;
	usage: undefined;
}

const mapToResponse = (
	outputs: Array<AIMessage | ErrorCompletion>,
	model: string,
): ConnectorResponse => {
	return {
		Completions: outputs.map((output) => {
			if ('error' in output) {
				return {
					Content: null,
					TokenUsage: undefined,
					Error: output.error,
				};
			} else {
				return {
					Content: output.text,
					TokenUsage: undefined,
				};
			}
		}),
		ModelType: model,
	};
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapErrorToCompletion = (error: any, model: string): ErrorCompletion => {
	const errorMessage = error.message || JSON.stringify(error);
	return {
		choices: [],
		error: errorMessage,
		model,
		usage: undefined,
	};
};

async function main(
	model: string,
	prompts: string[],
	properties: Record<string, unknown>,
	settings: Record<string, unknown>,
) {
	const total = prompts.length;
	const { prompt, ...restProperties } = properties;
	const systemPrompt = (prompt ||
		config.properties.find((prop) => prop.id === 'prompt')?.value) as string;

	const llm = new ChatOpenAI({
		openAIApiKey: settings['OPENAI_API_KEY'] as string,
		modelName: model,
		...restProperties,
	});

	const messageHistory = new ChatMessageHistory();
	await messageHistory.addMessage(new SystemMessage(systemPrompt));

	const tools = [
		new TavilySearchResults({
			apiKey: settings['TAVILY_API_KEY'] as string,
			maxResults: 1,
		}),
	];
	const promptTemplate = ChatPromptTemplate.fromMessages([
		['system', systemPrompt],
		['human', '{input}'],
		new MessagesPlaceholder('agent_scratchpad'),
	]);
	const agentExecutor = new AgentExecutor({
		agent: await createOpenAIFunctionsAgent({
			llm,
			tools,
			prompt: promptTemplate,
		}),
		tools,
	});

	const outputs: Array<AIMessage | ErrorCompletion> = [];

	try {
		for (let index = 0; index < total; index++) {
			try {
				console.log(messageHistory.getMessages());
				const result = await agentExecutor.invoke({
					input: prompts[index],
					chat_history: await messageHistory.getMessages(),
				});
				console.log(result);
				const agentResponse = new AIMessage(result.output);
				outputs.push(agentResponse);

				await messageHistory.addMessage(new HumanMessage(prompts[index]));
				await messageHistory.addMessage(agentResponse);

				console.log(
					`Response to prompt ${index + 1} of ${total}:`,
					result.output,
				);
			} catch (error) {
				const completionWithError = mapErrorToCompletion(error, model);
				outputs.push(completionWithError);
			}
		}

		return mapToResponse(outputs, model);
	} catch (error) {
		console.error('Error in main function:', error);
		return { Error: error, ModelType: model };
	}
}

export { main, config };
