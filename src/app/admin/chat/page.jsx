'use client';

import { useEffect, useState, useRef } from 'react';
import { fetchChatUsers } from './action';
import AdminLayout from '@/app/components/admin/AdminLayout';
import ChatComponent from '@/app/components/ChatComponent';

export default function AdminChatPage() {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [adminId] = useState(4); // ID admin tetap
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const getUsers = async () => {
            const data = await fetchChatUsers();
            setUsers(data);
            if (data.length > 0) setSelectedUser(data[0]);
        };
        getUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AdminLayout>
            <div className="flex h-[calc(100vh-64px)] bg-gradient-to-br from-gray-50 to-gray-100">
                {/* Sidebar - User List */}
                <div className="w-1/3 bg-white shadow-lg border-r border-gray-200 flex flex-col">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
                        <h2 className="text-xl font-bold text-white mb-4">Chat Users</h2>
                        {/* Search Bar */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/90 backdrop-blur-sm"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    {/* User List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredUsers.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                <p className="font-medium">No users found</p>
                                <p className="text-sm">Try adjusting your search</p>
                            </div>
                        ) : (
                            <ul className="space-y-1 p-2">
                                {filteredUsers.map((user) => (
                                    <li
                                        key={user.id}
                                        onClick={() => setSelectedUser(user)}
                                        className={`group relative p-4 cursor-pointer rounded-lg transition-all duration-200 hover:shadow-md ${selectedUser?.id === user.id
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                                            : 'hover:bg-gray-50 hover:shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            {/* Avatar */}
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg ${selectedUser?.id === user.id
                                                ? 'bg-white/20 text-white'
                                                : 'bg-gradient-to-br from-blue-400 to-purple-400 text-white'
                                                }`}>
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <p className={`font-semibold truncate ${selectedUser?.id === user.id ? 'text-white' : 'text-gray-900'
                                                    }`}>
                                                    {user.name}
                                                </p>
                                                <p className={`text-sm truncate ${selectedUser?.id === user.id ? 'text-white/80' : 'text-gray-500'
                                                    }`}>
                                                    {user.email}
                                                </p>
                                            </div>

                                            {/* Online indicator */}
                                            <div className={`w-3 h-3 rounded-full ${selectedUser?.id === user.id ? 'bg-green-300' : 'bg-green-400'
                                                }`} />
                                        </div>

                                        {/* Hover effect */}
                                        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="w-2/3 flex flex-col bg-white shadow-lg">
                    {selectedUser ? (
                        <div className="flex flex-col h-full">
                            {/* Chat Header */}
                            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 shadow-sm">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                                        {selectedUser.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">
                                            {selectedUser.name}
                                        </h3>
                                        <p className="text-white/80 text-sm">
                                            {selectedUser.email}
                                        </p>
                                    </div>
                                    <div className="ml-auto flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                                        <span className="text-white/90 text-sm font-medium">Online</span>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Content */}
                            <div className="flex-1 overflow-y-auto bg-gray-50">
                                <ChatComponent
                                    senderId={adminId}
                                    receiverId={selectedUser.id}
                                    isAdmin={true}
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100">
                            <div className="text-center p-8">
                                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-800 mb-2">Start a Conversation</h3>
                                <p className="text-gray-600 text-lg">Select a user from the sidebar to begin chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}