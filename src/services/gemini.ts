import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

// System prompt helper for generating hyper-targeted messages
export async function generateCampaignMessage(
  segmentName: string,
  criteriaDescription: string,
  channel: string,
  extraInstructions?: string
): Promise<string> {
  if (!apiKey) {
    return `Hey {name}, check out our premium offers! Standard fallback template due to missing GEMINI_API_KEY.`;
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are an expert AI Marketing copywriter for a premium brand.
      Generate a marketing message template for a customer campaign.
      
      Target Segment: "${segmentName}"
      Segment Criteria Description: "${criteriaDescription}"
      Delivery Channel: "${channel}" (Choose a copy style suited to this channel: short/punchy with emojis for SMS/WhatsApp, professional yet engaging with subject line for Email)
      ${extraInstructions ? `Additional User Request: "${extraInstructions}"` : ""}

      Rules for placeholders:
      - Use {name} for customer name.
      - Use {totalSpend} for customer's total spend.
      - Use {city} for customer's city.
      - Do NOT output formatting like markdown tables, just output the message body.
      - For Email channel, write "Subject: [Subject Line]" as the first line, followed by double newline and the body.
      - Keep character limits in mind: SMS < 160 chars, WhatsApp < 300 chars, Email < 800 chars.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini API campaign copy generation error:", error);
    return `Hello {name}, we have a special promotion waiting for you! Visit our site to explore catalog deals.`;
  }
}

// System prompt helper for AI Copilot parsing natural language instruction
export async function parseCopilotInstruction(
  instruction: string
): Promise<{
  segmentName: string;
  segmentDescription: string;
  conditions: Array<{
    field: "totalSpend" | "lastOrderDays" | "city";
    operator: "gt" | "lt" | "equals";
    value: string | number;
  }>;
  campaignName: string;
  channel: "SMS" | "EMAIL" | "WHATSAPP";
  messageTemplate: string;
}> {
  const fallback = {
    segmentName: "Re-engagement Segment",
    segmentDescription: "Audience flagged via natural language copilot request.",
    conditions: [{ field: "lastOrderDays" as const, operator: "gt" as const, value: 60 }],
    campaignName: "Copilot Campaign",
    channel: "EMAIL" as const,
    messageTemplate: "Hello {name}, we notice it's been a while since your last purchase. We'd love to welcome you back! Code: BACKTOUS",
  };

  if (!apiKey) {
    return fallback;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" },
    });

    const prompt = `
      You are the AI Marketing Copilot for a Retail CRM.
      Your task is to parse the user's natural language marketing instruction into a structured JSON query format.

      User Instruction: "${instruction}"

      Supported schema conditions format:
      - field: can only be "totalSpend" (value is number), "lastOrderDays" (value is number representing days since last order), or "city" (value is string).
      - operator: can only be "gt", "lt", or "equals".
      - value: matching format.

      Supported channels: "SMS", "EMAIL", "WHATSAPP"

      Output format MUST be JSON:
      {
        "segmentName": "Short descriptive name",
        "segmentDescription": "Brief description of the targeting rule",
        "conditions": [
          {
            "field": "totalSpend" | "lastOrderDays" | "city",
            "operator": "gt" | "lt" | "equals",
            "value": string | number
          }
        ],
        "campaignName": "A catchy campaign name",
        "channel": "SMS" | "EMAIL" | "WHATSAPP",
        "messageTemplate": "Generate a template body here using placeholders {name}, {totalSpend}, or {city}."
      }

      For example:
      User: "Bring back customers who haven't ordered in 60 days"
      Output:
      {
        "segmentName": "Inactive > 60 Days",
        "segmentDescription": "Last order date was more than 60 days ago",
        "conditions": [{"field": "lastOrderDays", "operator": "gt", "value": 60}],
        "campaignName": "We Miss You Campaign",
        "channel": "EMAIL",
        "messageTemplate": "Subject: We miss you, {name}!\n\nHey {name}, we haven't seen you around lately. Here is a special 15% discount for your next order!"
      }
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Copilot parser error:", error);
    return fallback;
  }
}
