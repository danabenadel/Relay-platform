import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.OPENAI_SERVICE_PORT || 5007;

let openai: OpenAI | null = null;

const toNumber = (value: any, fallback: number): number => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toInteger = (value: any, fallback: number): number => {
  const num = toNumber(value, fallback);
  return Number.isInteger(num) ? num : Math.round(num);
};

if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
  console.log("[OpenAI] API client initialized successfully");
} else {
  console.warn("[OpenAI] WARNING: OPENAI_API_KEY not configured");
}

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "openai-service",
    timestamp: new Date().toISOString(),
    apiConfigured: !!openai,
  });
});

app.post("/reactions/trigger", async (req, res) => {
  try {
    const { userId, reactionType, config, actionData } = req.body;

    if (!userId || !reactionType) {
      return res.status(400).json({
        success: false,
        error: "userId et reactionType sont requis",
      });
    }

    if (!openai) {
      return res.status(503).json({
        success: false,
        error: "OpenAI API key not configured",
      });
    }

    let result;

    switch (reactionType) {
      case "generate_text":
        result = await handleGenerateText(config);
        break;

      case "summarize_text":
        result = await handleSummarizeText(config);
        break;

      case "answer_question":
        result = await handleAnswerQuestion(config);
        break;

      case "code_review":
        result = await handleCodeReview(config);
        break;

      case "translate_text":
        result = await handleTranslateText(config);
        break;

      case "generate_creative":
        result = await handleGenerateCreative(config);
        break;

      case "explain_concept":
        result = await handleExplainConcept(config);
        break;

      case "generate_ideas":
        result = await handleGenerateIdeas(config);
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Type de réaction inconnu: ${reactionType}`,
        });
    }

    console.log(
      `[OpenAI] Reaction ${reactionType} executed successfully for user ${userId}`
    );

    res.json({
      success: true,
      message: "Réaction OpenAI exécutée avec succès",
      data: result,
    });
  } catch (error: any) {
    console.error("[OpenAI] Error executing reaction:", error.message);
    res.status(500).json({
      success: false,
      error: "Erreur lors de l'exécution de la réaction OpenAI",
      details: error.message,
    });
  }
});


async function handleGenerateText(config: any) {
  if (!config.prompt) {
    throw new Error("Configuration requise: prompt");
  }

  const response = await openai!.chat.completions.create({
    model: config.model || "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: config.prompt,
      },
    ],
    max_tokens: toInteger(config.maxTokens, 500),
    temperature: toNumber(config.temperature, 0.7),
  });

  return {
    text: response.choices[0].message.content,
    model: response.model,
    usage: response.usage,
  };
}

async function handleSummarizeText(config: any) {
  if (!config.text) {
    throw new Error("Configuration requise: text");
  }

  const maxLength = config.maxLength || "200 words";

  const response = await openai!.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a helpful assistant that summarizes text. Keep summaries concise, under ${maxLength}.`,
      },
      {
        role: "user",
        content: `Please summarize the following text:\n\n${config.text}`,
      },
    ],
    temperature: toNumber(config.temperature, 0.5),
  });

  return {
    summary: response.choices[0].message.content,
    originalLength: config.text.length,
    model: response.model,
  };
}

async function handleAnswerQuestion(config: any) {
  if (!config.question) {
    throw new Error("Configuration requise: question");
  }

  const messages: any[] = [
    {
      role: "system",
      content:
        "You are a helpful assistant that provides accurate and concise answers.",
    },
  ];

  if (config.context) {
    messages.push({
      role: "system",
      content: `Context: ${config.context}`,
    });
  }

  messages.push({
    role: "user",
    content: config.question,
  });

  const response = await openai!.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages,
    temperature: toNumber(config.temperature, 0.7),
  });

  return {
    answer: response.choices[0].message.content,
    model: response.model,
  };
}

async function handleCodeReview(config: any) {
  if (!config.code) {
    throw new Error("Configuration requise: code");
  }

  const language = config.language || "auto-detect";

  const response = await openai!.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide constructive feedback.",
      },
      {
        role: "user",
        content: `Please review this ${language} code:\n\n\`\`\`${language}\n${config.code}\n\`\`\``,
      },
    ],
    temperature: toNumber(config.temperature, 0.3),
  });

  return {
    review: response.choices[0].message.content,
    language,
    model: response.model,
  };
}

async function handleTranslateText(config: any) {
  if (!config.text || !config.targetLanguage) {
    throw new Error("Configuration requise: text, targetLanguage");
  }

  const sourceLanguage = config.sourceLanguage || "auto-detect";

  const response = await openai!.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate text from ${sourceLanguage} to ${config.targetLanguage}. Only provide the translation, no explanations.`,
      },
      {
        role: "user",
        content: config.text,
      },
    ],
    temperature: toNumber(config.temperature, 0.3),
  });

  return {
    translation: response.choices[0].message.content,
    sourceLanguage,
    targetLanguage: config.targetLanguage,
    model: response.model,
  };
}

async function handleGenerateCreative(config: any) {
  if (!config.type || !config.topic) {
    throw new Error("Configuration requise: type, topic");
  }

  const prompts: Record<string, string> = {
    poem: `Write a creative poem about: ${config.topic}`,
    story: `Write a short creative story about: ${config.topic}`,
    email: `Write a professional email about: ${config.topic}`,
    joke: `Write a funny joke about: ${config.topic}`,
    slogan: `Create a catchy slogan for: ${config.topic}`,
  };

  const prompt =
    prompts[config.type] ||
    `Create creative content about: ${config.topic}`;

  const response = await openai!.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You are a creative writer with excellent storytelling and writing skills.",
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    temperature: toNumber(config.temperature, 0.9),
  });

  return {
    content: response.choices[0].message.content,
    type: config.type,
    topic: config.topic,
    model: response.model,
  };
}

async function handleExplainConcept(config: any) {
  if (!config.concept) {
    throw new Error("Configuration requise: concept");
  }

  const level = config.level || "adult";

  const levelDescriptions: Record<string, string> = {
    child: "Explain like I'm 5 years old, using simple words and examples",
    teen: "Explain for a teenager, with clear examples and moderate detail",
    adult: "Explain with full detail and technical accuracy",
    expert:
      "Explain with advanced technical depth, assuming expertise in the field",
  };

  const response = await openai!.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: `You are an excellent teacher. ${
          levelDescriptions[level] || levelDescriptions.adult
        }.`,
      },
      {
        role: "user",
        content: `Explain: ${config.concept}`,
      },
    ],
    temperature: toNumber(config.temperature, 0.7),
  });

  return {
    explanation: response.choices[0].message.content,
    concept: config.concept,
    level,
    model: response.model,
  };
}

async function handleGenerateIdeas(config: any) {
  if (!config.topic) {
    throw new Error("Configuration requise: topic");
  }

  const count = toInteger(config.count, 5);

  const response = await openai!.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are a creative brainstorming assistant. Generate innovative and practical ideas.",
      },
      {
        role: "user",
        content: `Generate ${count} creative ideas about: ${config.topic}`,
      },
    ],
    temperature: toNumber(config.temperature, 0.8),
  });

  return {
    ideas: response.choices[0].message.content,
    topic: config.topic,
    count,
    model: response.model,
  };
}

app.listen(PORT, () => {
  console.log(`OpenAI Service running on port ${PORT}`);
  console.log(`API Status: ${openai ? "Ready" : "NOT CONFIGURED"}`);
  console.log(
    `Available reactions: generate_text, summarize_text, answer_question, code_review, translate_text, generate_creative, explain_concept, generate_ideas`
  );
});

