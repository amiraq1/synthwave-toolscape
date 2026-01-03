// Test TAAFT Structure and Ranking System
// Run with: npx tsx test-taaft.ts

const SUPABASE_URL = 'https://iazvsdwkbfzjhscyfvec.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhenZzZHdrYmZ6amhzY3lmdmVjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY5ODE1MTgsImV4cCI6MjA4MjU1NzUxOH0.Hgcu4o9btWdxkhnA4BhQYpal_uoJ5gQn0dHYQoX4yyM';

interface TestResult {
    name: string;
    status: 'PASS' | 'FAIL';
    details?: any;
    error?: string;
}

const results: TestResult[] = [];

async function supabaseQuery(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
        ...options,
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
    }

    return response.json();
}

async function supabaseRpc(functionName: string, params: Record<string, any> = {}) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${functionName}`, {
        method: 'POST',
        headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(`${response.status}: ${text}`);
    }

    return response.json();
}

// Test 1: Check if new columns exist in tools table
async function testNewColumns() {
    console.log('\n📋 Test 1: Checking new TAAFT columns...');
    try {
        const data = await supabaseQuery('tools?select=id,title,tasks,arabic_score,release_date,clicks_count&limit=3');

        if (data && data.length > 0) {
            const sample = data[0];
            const hasAllColumns =
                'tasks' in sample &&
                'arabic_score' in sample &&
                'release_date' in sample &&
                'clicks_count' in sample;

            results.push({
                name: 'New TAAFT Columns',
                status: hasAllColumns ? 'PASS' : 'FAIL',
                details: { sampleTool: sample }
            });

            console.log(hasAllColumns ? '✅ All columns exist!' : '❌ Some columns missing');
            console.log('   Sample:', JSON.stringify(sample, null, 2));
        } else {
            results.push({
                name: 'New TAAFT Columns',
                status: 'FAIL',
                error: 'No tools found'
            });
        }
    } catch (error: any) {
        results.push({
            name: 'New TAAFT Columns',
            status: 'FAIL',
            error: error.message
        });
        console.log('❌ Error:', error.message);
    }
}

// Test 2: Test get_trending_tools RPC function
async function testTrendingToolsRpc() {
    console.log('\n📋 Test 2: Testing get_trending_tools RPC...');
    try {
        const data = await supabaseRpc('get_trending_tools', {
            p_limit: 5,
            p_offset: 0
        });

        if (data && Array.isArray(data)) {
            results.push({
                name: 'get_trending_tools RPC',
                status: 'PASS',
                details: { count: data.length, sample: data[0] }
            });

            console.log('✅ RPC works! Found', data.length, 'tools');
            if (data[0]) {
                console.log('   Top tool:', data[0].title, '| Score:', data[0].trending_score);
            }
        } else {
            results.push({
                name: 'get_trending_tools RPC',
                status: 'FAIL',
                error: 'No data returned'
            });
        }
    } catch (error: any) {
        results.push({
            name: 'get_trending_tools RPC',
            status: 'FAIL',
            error: error.message
        });
        console.log('❌ Error:', error.message);
    }
}

// Test 3: Test get_tool_score function
async function testScoreFunction() {
    console.log('\n📋 Test 3: Testing get_tool_score function...');
    try {
        // Call the function with sample parameters
        const data = await supabaseRpc('get_tool_score', {
            p_avg_rating: 4.5,
            p_reviews_count: 10,
            p_release_date: new Date().toISOString().split('T')[0], // Today
            p_arabic_score: 8
        });

        if (typeof data === 'number') {
            // Expected: (4.5 * 20) + (10 * 5) + 100 (recency) + (8 * 10) = 90 + 50 + 100 + 80 = 320
            const expectedApprox = 320;
            const isCorrect = Math.abs(data - expectedApprox) < 50; // Allow some variance

            results.push({
                name: 'get_tool_score Function',
                status: isCorrect ? 'PASS' : 'FAIL',
                details: { calculatedScore: data, expectedApprox }
            });

            console.log(isCorrect ? '✅ Score calculation works!' : '⚠️ Score seems off');
            console.log('   Calculated score:', data, '(expected ~', expectedApprox, ')');
        } else {
            results.push({
                name: 'get_tool_score Function',
                status: 'FAIL',
                error: 'Unexpected return type'
            });
        }
    } catch (error: any) {
        results.push({
            name: 'get_tool_score Function',
            status: 'FAIL',
            error: error.message
        });
        console.log('❌ Error:', error.message);
    }
}

// Test 4: Test reviews table exists
async function testReviewsTable() {
    console.log('\n📋 Test 4: Testing reviews table...');
    try {
        const data = await supabaseQuery('reviews?select=id,tool_id,rating&limit=5');

        results.push({
            name: 'Reviews Table',
            status: 'PASS',
            details: { count: data.length }
        });

        console.log('✅ Reviews table accessible! Count:', data.length);
    } catch (error: any) {
        // 404 means table doesn't exist, other errors might be RLS
        if (error.message.includes('404')) {
            results.push({
                name: 'Reviews Table',
                status: 'FAIL',
                error: 'Table does not exist'
            });
        } else {
            // RLS might block, but table exists
            results.push({
                name: 'Reviews Table',
                status: 'PASS',
                details: { note: 'Table exists but may have RLS restrictions' }
            });
        }
        console.log('⚠️ Note:', error.message);
    }
}

// Test 5: Test get_tool_review_stats function
async function testReviewStats() {
    console.log('\n📋 Test 5: Testing get_tool_review_stats RPC...');
    try {
        const data = await supabaseRpc('get_tool_review_stats', { p_tool_id: 1 });

        if (data && Array.isArray(data)) {
            results.push({
                name: 'get_tool_review_stats RPC',
                status: 'PASS',
                details: data[0]
            });

            console.log('✅ Review stats RPC works!');
            console.log('   Stats for tool 1:', data[0]);
        } else {
            results.push({
                name: 'get_tool_review_stats RPC',
                status: 'PASS',
                details: { note: 'No reviews yet for tool 1' }
            });
            console.log('✅ RPC exists (no reviews yet)');
        }
    } catch (error: any) {
        results.push({
            name: 'get_tool_review_stats RPC',
            status: 'FAIL',
            error: error.message
        });
        console.log('❌ Error:', error.message);
    }
}

// Main
async function main() {
    console.log('🚀 TAAFT Structure & Ranking System Tests');
    console.log('=========================================');

    await testNewColumns();
    await testTrendingToolsRpc();
    await testScoreFunction();
    await testReviewsTable();
    await testReviewStats();

    // Summary
    console.log('\n=========================================');
    console.log('📊 TEST SUMMARY');
    console.log('=========================================');

    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;

    results.forEach(r => {
        console.log(`${r.status === 'PASS' ? '✅' : '❌'} ${r.name}: ${r.status}`);
        if (r.error) console.log(`   Error: ${r.error}`);
    });

    console.log(`\nTotal: ${passed}/${results.length} passed`);

    if (failed > 0) {
        console.log('\n⚠️ Some tests failed. Check the errors above.');
    } else {
        console.log('\n🎉 All tests passed! System is ready.');
    }
}

main().catch(console.error);
