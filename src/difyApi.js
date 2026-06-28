const DIFY_BASE_URL = process.env.REACT_APP_DIFY_BASE_URL || 'https://api.dify.ai/v1';
const DIFY_API_KEY = process.env.REACT_APP_DIFY_API_KEY || '';

/**
 * 发送聊天消息到 Dify API（阻塞模式）
 * @param {string} query - 用户消息
 * @param {string} conversationId - 对话 ID（可选，用于多轮对话）
 * @returns {Promise<object>} - { answer, conversationId }
 */
export async function sendChatMessage(query, conversationId = '') {
  const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query,
      response_mode: 'blocking',
      conversation_id: conversationId,
      user: 'react-chatbot-user',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API 请求失败: ${response.status}`);
  }

  const data = await response.json();
  return {
    answer: data.answer,
    conversationId: data.conversation_id,
  };
}

/**
 * 发送聊天消息到 Dify API（流式模式）
 * @param {string} query - 用户消息
 * @param {string} conversationId - 对话 ID
 * @param {function} onChunk - 每收到一块数据的回调
 * @returns {Promise<string>} - 最终的 conversationId
 */
export async function sendChatMessageStream(query, conversationId, onChunk) {
  const response = await fetch(`${DIFY_BASE_URL}/chat-messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${DIFY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: {},
      query,
      response_mode: 'streaming',
      conversation_id: conversationId,
      user: 'react-chatbot-user',
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API 请求失败: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let finalConversationId = conversationId;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith('data: ')) continue;

      try {
        const jsonStr = trimmed.slice(6);
        const event = JSON.parse(jsonStr);

        if (event.event === 'message' || event.event === 'agent_message') {
          onChunk(event.answer || '');
        } else if (event.event === 'message_end') {
          finalConversationId = event.conversation_id || finalConversationId;
        } else if (event.event === 'error') {
          throw new Error(event.message || '流式响应出错');
        }
      } catch (e) {
        if (e.message && !e.message.includes('JSON')) throw e;
      }
    }
  }

  return finalConversationId;
}
