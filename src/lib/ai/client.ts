export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export function assertAiConfigured() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "Chưa cấu hình OPENAI_API_KEY. Thêm key vào .env (local) hoặc Environment Variables (Vercel).",
    );
  }
}

export async function chatJson<T>(messages: ChatMessage[]): Promise<T> {
  assertAiConfigured();
  const base = (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";

  const res = await fetch(`${base}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`AI request failed (${res.status}): ${body.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI trả về rỗng");
  return JSON.parse(content) as T;
}
