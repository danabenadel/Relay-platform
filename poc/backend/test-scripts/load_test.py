import asyncio
import aiohttp
import time
import statistics

async def test_concurrency(url, concurrency, total_requests=200):
    """Test un niveau de concurrence spécifique"""
    semaphore = asyncio.Semaphore(concurrency)
    response_times = []
    success_count = 0
    
    async def single_request():
        nonlocal success_count
        async with semaphore:
            start = time.time()
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.get(url, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        if response.status == 200:
                            success_count += 1
                        response_times.append(time.time() - start)
            except Exception:
                response_times.append(10)  # Timeout
    
    start_time = time.time()
    await asyncio.gather(*[single_request() for _ in range(total_requests)])
    total_time = time.time() - start_time
    
    req_per_sec = round(total_requests / total_time)
    avg_latency = round(statistics.mean(response_times) * 1000, 2)
    success_rate = round((success_count / total_requests) * 100, 1)
    
    return {
        'concurrency': concurrency,
        'req_per_sec': req_per_sec,
        'avg_latency': avg_latency,
        'success_rate': success_rate
    }

async def progressive_load_test():
    servers = [
        ('Node.js', 'http://localhost:8080'),
        ('FastAPI', 'http://localhost:8081'), 
        ('Go + Gin', 'http://localhost:8082')
    ]
    
    concurrency_levels = [10, 50, 100, 200]
    results = {}
    
    for server_name, url in servers:
        print(f"\n🧪 Testing {server_name}...")
        results[server_name] = {}
        
        # Vérifier que le serveur répond
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as response:
                    if response.status != 200:
                        print(f"❌ {server_name} not responding")
                        continue
        except:
            print(f"❌ {server_name} not available")
            continue
            
        for concurrency in concurrency_levels:
            print(f"   📊 Testing {concurrency} concurrent connections...")
            result = await test_concurrency(url, concurrency, 100)  # 100 requests pour rapidité
            results[server_name][concurrency] = result
            
            print(f"   → {result['req_per_sec']} req/sec, {result['avg_latency']}ms latency, {result['success_rate']}% success")
            
            await asyncio.sleep(1)  # Pause entre tests
    
    # Tableau final
    print(f"\n📊 RÉSULTATS LOAD TEST:")
    print(f"{'Connections':<12} {'Node.js':<10} {'FastAPI':<10} {'Go + Gin':<10}")
    print("-" * 50)
    
    for concurrency in concurrency_levels:
        row = f"{concurrency:<12}"
        
        for server in ['Node.js', 'FastAPI', 'Go + Gin']:
            if server in results and concurrency in results[server]:
                perf = results[server][concurrency]['req_per_sec']
                row += f"{perf:<10}"
            else:
                row += f"{'N/A':<10}"
        
        print(row)
    
    # Analyse des résultats
    print(f"\n💡 ANALYSE DES PERFORMANCES:")
    print("-" * 50)
    
    # Trouver le meilleur serveur pour chaque niveau de concurrence
    for concurrency in concurrency_levels:
        best_server = None
        best_perf = 0
        
        for server in ['Node.js', 'FastAPI', 'Go + Gin']:
            if server in results and concurrency in results[server]:
                perf = results[server][concurrency]['req_per_sec']
                if perf > best_perf:
                    best_perf = perf
                    best_server = server
        
        if best_server:
            print(f"🏆 {concurrency} connexions: {best_server} ({best_perf} req/sec)")
    
    # Stabilité (taux de succès)
    print(f"\n📈 STABILITÉ (Taux de succès à 200 connexions):")
    print("-" * 50)
    
    high_concurrency = 200
    if high_concurrency in concurrency_levels:
        stability_results = []
        for server in ['Node.js', 'FastAPI', 'Go + Gin']:
            if server in results and high_concurrency in results[server]:
                success_rate = results[server][high_concurrency]['success_rate']
                stability_results.append((server, success_rate))
        
        # Trier par taux de succès
        stability_results.sort(key=lambda x: x[1], reverse=True)
        
        for i, (server, success_rate) in enumerate(stability_results, 1):
            icon = "🥇" if i == 1 else "🥈" if i == 2 else "🥉"
            print(f"{icon} {server}: {success_rate}% de succès")

if __name__ == "__main__":
    print("🔥 LOAD TEST - Progressive Concurrency")
    print("=====================================")
    
    # Vérifier qu'aiohttp est installé
    try:
        import aiohttp
    except ImportError:
        print("❌ Erreur: aiohttp n'est pas installé")
        print("💡 Installation: pip install aiohttp")
        exit(1)
    
    asyncio.run(progressive_load_test())