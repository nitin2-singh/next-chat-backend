export const chatPresence = new Map<string, Set<string>>();

export function addUserToChat(chatId: string, userId: string) {
  if (!chatPresence.has(chatId)) {
    chatPresence.set(chatId, new Set());
  }
  chatPresence.get(chatId)!.add(userId);
}

export function removeUserFromChat(chatId: string, userId: string) {
  const users = chatPresence.get(chatId);
  if (!users) return;

  users.delete(userId);
  if (users.size === 0) {
    chatPresence.delete(chatId);
  }
}

export function isUserOnlineInChat(chatId: string, userId: string) {
  return chatPresence.get(chatId)?.has(userId) ?? false;
}
