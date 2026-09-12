import { API } from './api';
export type ChatMessage = { role: 'user' | 'assistant'; text: string; product_ids?: string[]; comparison_query?: string; search_links?: { merchant: string; url: string }[]; live_prices_available?: boolean; basket_total?: number; budget?: number | null; cart_subtotal?: number };
export type ChatSession = { id: string; messages: ChatMessage[] };
export function streamChat(session: string, message: string, onDelta: (text: string) => void, onDone: (result: ChatMessage) => void, onError: (text: string) => void, context?: { budget: number | null; preference: 'any' | 'vegetarian'; cart_items: { id: string; qty: number }[] }) {
  const xhr = new XMLHttpRequest(); let read = 0; let buffered = ''; let done = false;
  const consume = () => {
    buffered += xhr.responseText.slice(read); read = xhr.responseText.length;
    const lines = buffered.split('\n'); buffered = lines.pop() || '';
    for (const line of lines) {
      if (!line.trim()) continue;
      try { const e = JSON.parse(line); if (e.type === 'delta') onDelta(e.text); if (e.type === 'done') { done = true; onDone({ ...e, role: 'assistant' }); } if (e.type === 'error') { done = true; onError(e.message); } } catch { /* Wait for complete NDJSON frames. */ }
    }
  };
  xhr.open('POST', `${API}/assistant/chat`); xhr.setRequestHeader('Content-Type', 'application/json'); xhr.timeout = 80000;
  xhr.onprogress = () => { if (xhr.status === 200) consume(); };
  xhr.onload = () => { if (xhr.status === 200) { consume(); if (!done) onError('The reply was interrupted. Please try again.'); } else { let error = 'Could not reach One. Please try again.'; try { const parsed = JSON.parse(xhr.responseText); if (typeof parsed.detail === 'string') error = parsed.detail; } catch {} onError(error); } };
  xhr.onerror = () => onError('Connection lost. Your message is ready to retry.'); xhr.ontimeout = () => onError('One took too long to reply. Please try again.');
  xhr.send(JSON.stringify({ session_id: session, message, ...context }));
  return () => { xhr.onprogress = null; xhr.onload = null; xhr.onerror = null; xhr.ontimeout = null; xhr.abort(); };
}