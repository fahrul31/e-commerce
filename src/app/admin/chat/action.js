'use client';

export const fetchChatUsers = async () => {
    try {
        const response = await fetch(`/api/chat/chat-users`);
        const data = await response.json();
        const listUsers = data.data;
        console.log(listUsers);
        return listUsers;
    } catch (error) {
        console.error("Failed to fetch chat users:", error);
        return [];
    }
};
