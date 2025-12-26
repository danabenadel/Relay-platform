const http = require('http');
const { URL } = require('url');

// Fonction helper pour faire des requêtes HTTP
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const requestOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port,
            path: parsedUrl.pathname,
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        const req = http.request(requestOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = data ? JSON.parse(data) : {};
                    resolve({
                        status: res.statusCode,
                        data: jsonData,
                        headers: res.headers
                    });
                } catch (err) {
                    resolve({
                        status: res.statusCode,
                        data: data,
                        headers: res.headers
                    });
                }
            });
        });

        req.on('error', reject);

        if (options.data) {
            req.write(JSON.stringify(options.data));
        }

        req.end();
    });
}

async function testAuthWorkflow(baseUrl, serverName) {
    console.log(`\n Testing ${serverName} (${baseUrl})`);
    console.log("─".repeat(40));
    
    const timestamp = Date.now();
    const userData = {
        email: `test${timestamp}@example.com`,
        username: `user${timestamp}`,
        password: 'password123'
    };
    
    try {
        const startTime = Date.now();
        
        console.log("    Registration...");
        const regStart = Date.now();
        const registerResponse = await makeRequest(`${baseUrl}/register`, {
            method: 'POST',
            data: userData
        });
        const regTime = Date.now() - regStart;
        
        if (registerResponse.status !== 201 && registerResponse.status !== 200) {
            throw new Error(`Registration failed: ${registerResponse.status}`);
        }
        
        const token = registerResponse.data.token || registerResponse.data.access_token;
        if (!token) {
            throw new Error('No token received from registration');
        }
        
        console.log(`    Register: ${regTime}ms`);
        
        console.log("    Login...");
        const loginStart = Date.now();
        const loginResponse = await makeRequest(`${baseUrl}/login`, {
            method: 'POST',
            data: {
                email: userData.email,
                password: userData.password
            }
        });
        const loginTime = Date.now() - loginStart;
        
        if (loginResponse.status !== 200) {
            throw new Error(`Login failed: ${loginResponse.status}`);
        }
        
        console.log(`    Login: ${loginTime}ms`);
        
        // 3. Profile
        console.log("    Profile access...");
        const profileStart = Date.now();
        const profileResponse = await makeRequest(`${baseUrl}/profile`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileTime = Date.now() - profileStart;
        
        if (profileResponse.status !== 200) {
            throw new Error(`Profile access failed: ${profileResponse.status}`);
        }
        
        console.log(`    Profile: ${profileTime}ms`);
        
        const totalTime = Date.now() - startTime;
        console.log(`    Total: ${totalTime}ms`);
        
        return {
            success: true,
            totalTime,
            registerTime: regTime,
            loginTime,
            profileTime,
            server: serverName
        };
        
    } catch (error) {
        console.log(`    Error: ${error.message}`);
        return {
            success: false,
            error: error.message,
            server: serverName
        };
    }
}

async function runAuthTests() {
    console.log(" AUTHENTICATION WORKFLOW BENCHMARK");
    console.log("====================================");
    
    const servers = [
        { name: 'Node.js', url: 'http://localhost:8080' },
        { name: 'FastAPI', url: 'http://localhost:8081' },
        { name: 'Go + Gin', url: 'http://localhost:8082' }
    ];
    
    const results = [];
    
    for (const server of servers) {
        const result = await testAuthWorkflow(server.url, server.name);
        if (result.success) {
            results.push(result);
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    if (results.length > 0) {
        console.log('\n AUTHENTICATION BENCHMARK RESULTS:');
        console.log('━'.repeat(60));
        function padRight(str, width) {
            return str.toString().padEnd(width);
        }
        console.log(
            padRight('Technology', 12) + 
            padRight('Total', 10) + 
            padRight('Register', 12) + 
            padRight('Login', 10) + 
            padRight('Profile', 10)
        );
        console.log('━'.repeat(60));
        
        results.forEach(result => {
            console.log(
                padRight(result.server, 12) + 
                padRight(result.totalTime + 'ms', 10) + 
                padRight(result.registerTime + 'ms', 12) + 
                padRight(result.loginTime + 'ms', 10) + 
                padRight(result.profileTime + 'ms', 10)
            );
        });
        
        results.sort((a, b) => a.totalTime - b.totalTime);
        console.log('\n Ranking (fastest to slowest):');
        results.forEach((result, index) => {
            console.log(`${index + 1}. ${result.server}: ${result.totalTime}ms`);
        });
        
        console.log('\n Analysis:');
        if (results.length >= 2) {
            const fastest = results[0];
            const slowest = results[results.length - 1];
            const improvement = ((slowest.totalTime - fastest.totalTime) / slowest.totalTime * 100).toFixed(1);
            console.log(`   ${fastest.server} is ${improvement}% faster than ${slowest.server}`);
        }
    } else {
        console.log('\n No servers responded successfully. Make sure they are running:');
        servers.forEach(server => {
            console.log(`   • ${server.name} server on ${server.url.replace('http://localhost:', 'port ')}`);
        });
    }
}

runAuthTests().catch(console.error);