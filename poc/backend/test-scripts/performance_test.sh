#!/bin/bash

echo "🧪 PERFORMANCE BENCHMARK - Apache Bench"
echo "========================================"

# Fonction pour tester un serveur
test_server() {
    local name=$1
    local url=$2
    local port=$3
    
    echo ""
    echo "🔍 Testing $name ($url)"
    echo "----------------------------------------"
    
    # Vérifier si le serveur répond
    if curl -s -f "$url" > /dev/null; then
        echo "✅ Server is responding"
        
        # Test avec Apache Bench
        echo "📊 Running Apache Bench (100 requests, 10 concurrent)..."
        ab -n 100 -c 10 -q "$url" | grep -E "(Requests per second|Time per request)" | head -2
        
        echo ""
        echo "📊 Running Apache Bench (1000 requests, 50 concurrent)..."
        ab -n 1000 -c 50 -q "$url" | grep -E "(Requests per second|Time per request)" | head -2
        
    else
        echo "❌ Server not responding"
    fi
}

# Tester les 3 serveurs
test_server "Node.js" "http://localhost:8080/" "8080"
test_server "FastAPI" "http://localhost:8081/" "8081"  
test_server "Go + Gin" "http://localhost:8082/" "8082"

echo ""
echo "✅ Performance tests completed!"
echo "💡 Make sure all 3 servers are running before testing"
