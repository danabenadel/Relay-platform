#!/bin/bash
# complete-benchmark.sh - Benchmark complet de toutes les stacks

echo "🚀 BENCHMARK COMPLET DES STACKS WEB"
echo "====================================="

# Couleurs pour l'output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration des frameworks
declare -A FRAMEWORKS=(
    ["nuxt"]="3000" 
    ["sveltekit"]="4173"
    ["html"]="5500"
)

declare -A BUILD_DIRS=(
    ["nuxt"]=".output"
    ["sveltekit"]="build"
    ["html"]="."
)

declare -A BUILD_COMMANDS=(
    ["nuxt"]="npm run build"
    ["sveltekit"]="npm run build"
    ["html"]="echo 'No build needed'"
)

declare -A START_COMMANDS=(
    ["nuxt"]="npm run preview"
    ["sveltekit"]="npm run preview"
    ["html"]="live-server or similar on port 5500"
)

# Fonction pour mesurer la taille des répertoires
get_size() {
    du -sh "$1" 2>/dev/null | cut -f1
}

# Fonction pour vérifier si un port est occupé
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 0  # Port occupé
    else
        return 1  # Port libre
    fi
}

# Fonction pour tester le temps de réponse avec retry
test_response_time() {
    local url=$1
    local name=$2
    local max_retries=5
    local retry_count=0
    
    echo -e "${BLUE}Testing $name...${NC}"
    
    while [ $retry_count -lt $max_retries ]; do
        # Test de connectivité d'abord
        if curl -s --connect-timeout 2 "$url" >/dev/null 2>&1; then
            # Test avec 3 essais pour la moyenne
            local total=0
            local count=3
            local success=true
            
            for i in $(seq 1 $count); do
                local time=$(curl -o /dev/null -s -w "%{time_total}" "$url" 2>/dev/null)
                if [ $? -eq 0 ]; then
                    total=$(echo "$total + $time" | bc -l 2>/dev/null || echo "$total")
                else
                    success=false
                    break
                fi
                sleep 0.5
            done
            
            if [ "$success" = true ] && command -v bc >/dev/null 2>&1; then
                local avg=$(echo "scale=3; $total / $count * 1000" | bc -l)
                echo -e "${GREEN}✅ $name: ${avg}ms average${NC}"
                echo "$name,$avg" >> benchmark-times.csv
                return 0
            fi
        fi
        
        retry_count=$((retry_count + 1))
        echo -e "${YELLOW}⏳ Retry $retry_count/$max_retries for $name...${NC}"
        sleep 2
    done
    
    echo -e "${RED}❌ Failed to reach $name after $max_retries attempts${NC}"
    echo "$name,Error" >> benchmark-times.csv
    return 1
}

# Fonction pour build un framework
build_framework() {
    local framework=$1
    local project_dir="benchmark-${framework}"
    
    if [ ! -d "$project_dir" ]; then
        echo -e "${RED}❌ Project directory $project_dir not found${NC}"
        return 1
    fi
    
    echo -e "${BLUE}Building $framework...${NC}"
    cd "$project_dir"
    
    # Executer la commande de build
    local build_cmd="${BUILD_COMMANDS[$framework]}"
    eval $build_cmd > build.log 2>&1
    
    if [ $? -eq 0 ]; then
        local build_dir="${BUILD_DIRS[$framework]}"
        if [ -d "$build_dir" ] || [ "$framework" = "html" ]; then
            local size
            if [ "$framework" = "html" ]; then
                size=$(du -sh index.html 2>/dev/null | cut -f1)
            else
                size=$(get_size "$build_dir")
            fi
            echo -e "${GREEN}✅ $framework: $size${NC}"
            echo "$framework,$size" >> ../benchmark-sizes.csv
        else
            echo -e "${RED}❌ Build directory $build_dir not found for $framework${NC}"
            echo "$framework,Build Dir Error" >> ../benchmark-sizes.csv
        fi
    else
        echo -e "${RED}❌ Build failed for $framework${NC}"
        echo "$framework,Build Failed" >> ../benchmark-sizes.csv
        cat build.log | tail -10
    fi
    
    cd ..
}

# Fonction pour analyser les dépendances
analyze_dependencies() {
    echo -e "${PURPLE}📦 ANALYSE DES DÉPENDANCES${NC}"
    echo "================================"
    
    echo "Framework,Dependencies,DevDependencies,Total" > benchmark-deps.csv
    
    for framework in "${!FRAMEWORKS[@]}"; do
        local project_dir="benchmark-${framework}"
        
        if [ -f "$project_dir/package.json" ]; then
            cd "$project_dir"
            local deps=$(jq '.dependencies | length' package.json 2>/dev/null || echo "0")
            local devDeps=$(jq '.devDependencies | length' package.json 2>/dev/null || echo "0")
            local total=$((deps + devDeps))
            
            echo -e "${BLUE}$framework: $deps deps + $devDeps devDeps = $total total${NC}"
            echo "$framework,$deps,$devDeps,$total" >> ../benchmark-deps.csv
            cd ..
        else
            echo -e "${YELLOW}$framework: No package.json found${NC}"
            echo "$framework,N/A,N/A,N/A" >> benchmark-deps.csv
        fi
    done
}

# Fonction pour mesurer l'utilisation mémoire
measure_memory_usage() {
    echo -e "${PURPLE}💾 MESURE DE L'UTILISATION MÉMOIRE${NC}"
    echo "===================================="
    
    echo "Framework,Memory Usage (MB)" > benchmark-memory.csv
    
    for framework in "${!FRAMEWORKS[@]}"; do
        local port="${FRAMEWORKS[$framework]}"
        
        if check_port $port; then
            # Trouver le PID du processus sur le port
            local pid=$(lsof -ti:$port | head -1)
            if [ ! -z "$pid" ]; then
                # Mesurer la mémoire (RSS en KB)
                local memory=$(ps -p $pid -o rss= 2>/dev/null)
                if [ ! -z "$memory" ]; then
                    local memory_mb=$((memory / 1024))
                    echo -e "${BLUE}$framework: ${memory_mb}MB${NC}"
                    echo "$framework,$memory_mb" >> benchmark-memory.csv
                else
                    echo -e "${YELLOW}$framework: Memory info not available${NC}"
                    echo "$framework,N/A" >> benchmark-memory.csv
                fi
            else
                echo -e "${YELLOW}$framework: PID not found${NC}"
                echo "$framework,N/A" >> benchmark-memory.csv
            fi
        else
            echo -e "${RED}$framework: Not running${NC}"
            echo "$framework,Not Running" >> benchmark-memory.csv
        fi
    done
}

# Fonction principale
main() {
    echo -e "${YELLOW}🔧 PRÉPARATION${NC}"
    echo "=============="
    
    # Créer les fichiers CSV
    echo "Framework,Build Size" > benchmark-sizes.csv
    echo "Framework,Response Time (ms)" > benchmark-times.csv
    
    # Vérifier les dépendances
    if ! command -v bc >/dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  bc not found, installing...${NC}"
        if command -v apt >/dev/null 2>&1; then
            sudo apt install -y bc
        elif command -v brew >/dev/null 2>&1; then
            brew install bc
        else
            echo -e "${RED}❌ Please install bc manually${NC}"
        fi
    fi
    
    echo ""
    echo -e "${YELLOW}📦 BUILD SIZE COMPARISON${NC}"
    echo "========================="
    
    # Build tous les frameworks
    for framework in "${!FRAMEWORKS[@]}"; do
        build_framework "$framework"
    done
    
    echo ""
    echo -e "${YELLOW}📊 ANALYSE DES DÉPENDANCES${NC}"
    analyze_dependencies
    
    echo ""
    echo -e "${YELLOW}⚡ TESTS DE PERFORMANCE${NC}"
    echo "=========================="
    echo -e "${BLUE}Assurez-vous que tous les serveurs sont lancés :${NC}"
    
    for framework in "${!FRAMEWORKS[@]}"; do
        local port="${FRAMEWORKS[$framework]}"
        echo "- $framework: http://localhost:$port (${START_COMMANDS[$framework]})"
    done
    
    echo ""
    read -p "Appuyez sur Entrée quand tous les serveurs sont prêts..."
    
    # Tester les temps de réponse
    test_response_time "http://localhost:3000" "nuxt"
    test_response_time "http://localhost:4173" "sveltekit"
    test_response_time "http://127.0.0.1:5500/benchmark-html/index.html" "html"
    
    echo ""
    measure_memory_usage
    
    echo ""
    echo -e "${YELLOW}📊 RÉSULTATS FINAUX${NC}"
    echo "==================="
    
    echo -e "${BLUE}Tailles de build :${NC}"
    column -t -s ',' benchmark-sizes.csv
    
    echo ""
    echo -e "${BLUE}Temps de réponse :${NC}"
    column -t -s ',' benchmark-times.csv
    
    echo ""
    echo -e "${BLUE}Dépendances :${NC}"
    column -t -s ',' benchmark-deps.csv
    
    echo ""
    echo -e "${BLUE}Utilisation mémoire :${NC}"
    column -t -s ',' benchmark-memory.csv
    
    echo ""
    echo -e "${GREEN}✅ Benchmark terminé !${NC}"
    echo "Fichiers générés :"
    echo "- benchmark-sizes.csv"
    echo "- benchmark-times.csv"
    echo "- benchmark-deps.csv"
    echo "- benchmark-memory.csv"
    
    # Générer un résumé
    generate_summary
}

# Fonction pour générer un résumé
generate_summary() {
    echo ""
    echo -e "${PURPLE}🏆 RÉSUMÉ EXÉCUTIF${NC}"
    echo "=================="
    
    # Analyser les gagnants
    echo "GAGNANTS PAR CATÉGORIE :"
    echo ""
    
    # Le plus rapide (temps de réponse le plus bas, excluant les erreurs)
    fastest=$(grep -v "Error\|Framework" benchmark-times.csv | sort -t',' -k2 -n | head -1 | cut -d',' -f1)
    if [ ! -z "$fastest" ]; then
        echo "🥇 Plus rapide : $fastest"
    fi
    
    # Le plus léger (taille de build la plus petite)
    lightest=$(grep -v "Error\|Build Failed\|Framework" benchmark-sizes.csv | while IFS=',' read -r name size; do
        # Convertir la taille en bytes pour comparaison
        size_num=$(echo "$size" | sed 's/[A-Za-z]//g')
        echo "$size_num,$name"
    done | sort -t',' -k1 -n | head -1 | cut -d',' -f2)
    
    if [ ! -z "$lightest" ]; then
        echo "🪶 Plus léger : $lightest"
    fi
    
    # Le moins de dépendances
    minimal_deps=$(grep -v "N/A\|Framework" benchmark-deps.csv | sort -t',' -k4 -n | head -1 | cut -d',' -f1)
    if [ ! -z "$minimal_deps" ]; then
        echo "📦 Moins de dépendances : $minimal_deps"
    fi
    
    echo ""
    echo "RECOMMANDATION POUR AREA PROJECT :"
    echo "Basé sur l'équilibre performance/fonctionnalités"
}

# Exécution du script
main "$@"