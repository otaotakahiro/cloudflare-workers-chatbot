export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Persona {
  id: string;
  name: string;
  role: string;
  tone: string;
  description: string;
  avatar: string;
  backgroundColor: string;
  textColor: string;
}

export interface ChatRequest {
  message: string;
  sessionId: string;
  persona?: Persona;
}

export interface ChatResponse {
  response: string;
}
