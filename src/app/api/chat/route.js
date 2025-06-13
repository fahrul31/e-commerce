import { NextResponse } from 'next/server';


export async function POST(request) {
    const { userId, adminId, message } = await request.json();


    try {
        const res = await fetch('http://localhost:5000/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, adminId, message })
        });


        const data = await res.json();


        if (data.success) {
            return NextResponse.json({ success: true, message: 'Message sent successfully' });
        } else {
            return NextResponse.json({ success: false, message: 'Failed to send message' });
        }
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ success: false, message: 'Internal server error' });
    }
}


