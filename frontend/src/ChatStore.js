// src/chatStore.js
import { create } from "zustand";

export const useChatStore = create((set) => ({
  chats: [],
  selectedChatId: null,

  setChats: (chats) => set({ chats }),
  selectChat: (chatId) => set({ selectedChatId: chatId }),
  createNewChat: () =>
    set((state) => {
      const newChat = {
        id: Date.now().toString(),
        title: "Untitled",
      };
      return {
        chats: [newChat, ...state.chats],
        selectedChatId: newChat.id,
      };
    }),
}));
