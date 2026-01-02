
// Native fetch is used
// If running with tsx/node 18+, fetch is global.

const FUNCTION_URL = 'https://iazvsdwkbfzjhscyfvec.supabase.co/functions/v1/chat';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhenZzZHdrYmZ6amhzY3lmdmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODE1MTgsImV4cCI6MjA4MjU1NzUxOH0.Hgcu4o9btWdxkhnA4BhQYpal_uoJ5gQn0dHYQoX4yyM';

async function testChat() {
    console.log('🤖 Testing Nabd AI Agent...');
    console.log(`URL: ${FUNCTION_URL}`);

    try {
        const response = await fetch(FUNCTION_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ANON_KEY}`,
            },
            body: JSON.stringify({
                query: 'أريد أداة لتوليد الصور',
            }),
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`❌ Error (${response.status}):`, text);
            return;
        }

        const data = await response.json();
        console.log('✅ Response Received:');
        console.log('-----------------------------------');
        console.log('Answer:', data.answer);
        console.log('-----------------------------------');
        console.log('Recommended Tools:', data.tools?.map((t: any) => t.title).join(', '));

    } catch (error) {
        console.error('❌ Network Error:', error);
    }
}

testChat();
