type OpenRouterSuccess = {
  ok: true;
  content: string;
  tokensPrompt: number | null;
  tokensResponse: number | null;
};

type OpenRouterFailure = {
  ok: false;
  reason: "missing_key" | "request_failed" | "empty_response";
  message: string;
};

export type OpenRouterGenerationResult = OpenRouterSuccess | OpenRouterFailure;

export async function generateFromOpenRouter(input: {
  model: string;
  prompt: string;
}): Promise<OpenRouterGenerationResult> {
  const key = process.env.OPENROUTER_KEY;

  if (!key) {
    return {
      ok: false,
      reason: "missing_key",
      message:
        "No se detectó OPENROUTER_KEY. Pega una respuesta manual en el campo correspondiente.",
    };
  }

  console.log('Sending generation request to OpenRouter with model:', input.model)

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: 'minimax/minimax-m2.5:free', //input.model,
        messages: [
          {
            role: "system",
            content:
              "You are an assistant that generates a high-quality example output for a user prompt.",
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        ok: false,
        reason: "request_failed",
        message:
          errorText ||
          `OpenRouter respondió con status ${response.status}. Pega una respuesta manual.`,
      };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return {
        ok: false,
        reason: "empty_response",
        message:
          "OpenRouter no devolvió contenido. Pega una respuesta manual en el campo.",
      };
    }

    return {
      ok: true,
      content,
      tokensPrompt:
        typeof data.usage?.prompt_tokens === "number"
          ? data.usage.prompt_tokens
          : null,
      tokensResponse:
        typeof data.usage?.completion_tokens === "number"
          ? data.usage.completion_tokens
          : null,
    };
  } catch (error) {
    return {
      ok: false,
      reason: "request_failed",
      message:
        error instanceof Error
          ? `${error.message}. Pega una respuesta manual en el campo.`
          : "No se pudo conectar con OpenRouter. Pega una respuesta manual.",
    };
  }
}
