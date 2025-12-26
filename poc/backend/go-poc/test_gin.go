package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"sync"
	"time"
)

type TestUser struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Password string `json:"password"`
}

type TestLogin struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type TokenResponse struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	User        struct {
		ID       int    `json:"id"`
		Email    string `json:"email"`
		Username string `json:"username"`
	} `json:"user"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message,omitempty"`
}

const (
	BASE_URL = "http://localhost:8082"
)

const (
	ColorGreen  = "\033[32m"
	ColorRed    = "\033[31m"
	ColorYellow = "\033[33m"
	ColorBlue   = "\033[34m"
	ColorBold   = "\033[1m"
	ColorReset  = "\033[0m"
)

func log(color, message string) {
	fmt.Printf("%s%s%s\n", color, message, ColorReset)
}

func makeRequest(method, url string, body interface{}, headers map[string]string) (*http.Response, error) {
	var reqBody io.Reader
	
	if body != nil {
		jsonData, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(jsonData)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	
	for key, value := range headers {
		req.Header.Set(key, value)
	}

	client := &http.Client{Timeout: 10 * time.Second}
	return client.Do(req)
}

func parseJSON(resp *http.Response, target interface{}) error {
	defer resp.Body.Close()
	return json.NewDecoder(resp.Body).Decode(target)
}

func testCompleteFlow() bool {
	log(ColorBlue, "\n"+strings.Repeat("=", 60))
	log(ColorBold, "🧪 TEST COMPLET POC AREA - Go + Gin")
	log(ColorBlue, strings.Repeat("=", 60))

	var userToken string

	log(ColorYellow, "\n📋 TEST 1: API de base")
	
	resp, err := makeRequest("GET", BASE_URL+"/", nil, nil)
	if err != nil {
		log(ColorRed, " Erreur de connexion: "+err.Error())
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		log(ColorGreen, " Route d'accueil OK")
		
		var homeData map[string]interface{}
		if err := parseJSON(resp, &homeData); err == nil {
			if features, ok := homeData["features"].(map[string]interface{}); ok {
				var featureNames []string
				for key := range features {
					featureNames = append(featureNames, key)
				}
				fmt.Printf("   Features: %v\n", featureNames)
			}
		}
	} else {
		log(ColorRed, fmt.Sprintf(" Erreur route accueil: %d", resp.StatusCode))
		return false
	}

	log(ColorYellow, "\n👤 TEST 2: Inscription")
	
	timestamp := time.Now().Unix()
	userData := TestUser{
		Email:    fmt.Sprintf("test%d@example.com", timestamp),
		Username: fmt.Sprintf("testuser%d", timestamp),
		Password: "password123",
	}

	resp, err = makeRequest("POST", BASE_URL+"/register", userData, nil)
	if err != nil {
		log(ColorRed, " Erreur inscription: "+err.Error())
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 201 {
		log(ColorGreen, " Inscription réussie")
		
		var tokenResp TokenResponse
		if err := parseJSON(resp, &tokenResp); err == nil {
			fmt.Printf("   Utilisateur: %s\n", tokenResp.User.Email)
			userToken = tokenResp.AccessToken
		}
	} else {
		log(ColorRed, fmt.Sprintf(" Erreur inscription: %d", resp.StatusCode))
		return false
	}

	log(ColorYellow, "\n🔐 TEST 3: Connexion")
	
	loginData := TestLogin{
		Email:    userData.Email,
		Password: userData.Password,
	}

	resp, err = makeRequest("POST", BASE_URL+"/login", loginData, nil)
	if err != nil {
		log(ColorRed, " Erreur connexion: "+err.Error())
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		log(ColorGreen, " Connexion réussie")
		
		var tokenResp TokenResponse
		if err := parseJSON(resp, &tokenResp); err == nil {
			fmt.Printf("   Token reçu: %s...\n", tokenResp.AccessToken[:20])
		}
	} else {
		log(ColorRed, fmt.Sprintf(" Erreur connexion: %d", resp.StatusCode))
		return false
	}

	log(ColorYellow, "\n🔒 TEST 4: Route protégée")
	
	headers := map[string]string{
		"Authorization": "Bearer " + userToken,
	}

	resp, err = makeRequest("GET", BASE_URL+"/profile", nil, headers)
	if err != nil {
		log(ColorRed, " Erreur profil: "+err.Error())
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		log(ColorGreen, " Accès profil OK")
		
		var profileData map[string]interface{}
		if err := parseJSON(resp, &profileData); err == nil {
			username, _ := profileData["username"].(string)
			email, _ := profileData["email"].(string)
			fmt.Printf("   Profil: %s (%s)\n", username, email)
		}
	} else {
		log(ColorRed, fmt.Sprintf(" Erreur profil: %d", resp.StatusCode))
		return false
	}

	log(ColorYellow, "\n📊 TEST 5: Route about.json")
	
	resp, err = makeRequest("GET", BASE_URL+"/about.json", nil, nil)
	if err != nil {
		log(ColorRed, " Erreur about.json: "+err.Error())
		return false
	}
	defer resp.Body.Close()

	if resp.StatusCode == 200 {
		log(ColorGreen, " Route about.json OK")
		
		var aboutData map[string]interface{}
		if err := parseJSON(resp, &aboutData); err == nil {
			if server, ok := aboutData["server"].(map[string]interface{}); ok {
				if services, ok := server["services"].([]interface{}); ok {
					fmt.Printf("   Services: %d\n", len(services))
				}
				if timestamp, ok := server["current_time"].(float64); ok {
					fmt.Printf("   Timestamp: %.0f\n", timestamp)
				}
			}
		}
	} else {
		log(ColorRed, fmt.Sprintf(" Erreur about.json: %d", resp.StatusCode))
		return false
	}

	log(ColorYellow, "\n⚡ TEST 6: Performance basique")
	
	requestCount := 50
	startTime := time.Now()
	
	sem := make(chan struct{}, 10)
	var wg sync.WaitGroup
	successCount := 0
	var mu sync.Mutex
	
	for i := 0; i < requestCount; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()
			
			resp, err := makeRequest("GET", BASE_URL+"/ping", nil, nil)
			if err == nil && resp.StatusCode == 200 {
				mu.Lock()
				successCount++
				mu.Unlock()
				resp.Body.Close()
			}
		}()
	}
	
	wg.Wait()
	duration := time.Since(startTime)
	reqPerSec := float64(requestCount) / duration.Seconds()
	
	log(ColorGreen, fmt.Sprintf(" Performance: %.0f req/sec", reqPerSec))
	fmt.Printf("   %d/%d requêtes réussies en %.2fs\n", successCount, requestCount, duration.Seconds())

	log(ColorYellow, "\n TEST 7: Gestion d'erreurs")
	
	resp, err = makeRequest("GET", BASE_URL+"/route-inexistante", nil, nil)
	if err == nil && resp.StatusCode == 404 {
		log(ColorGreen, " Erreur 404 gérée correctement")
		resp.Body.Close()
	}
	
	resp, err = makeRequest("GET", BASE_URL+"/profile", nil, nil)
	if err == nil && resp.StatusCode == 401 {
		log(ColorGreen, " Authentification requise gérée")
		resp.Body.Close()
	}
	
	badHeaders := map[string]string{
		"Authorization": "Bearer token-invalide",
	}
	resp, err = makeRequest("GET", BASE_URL+"/profile", nil, badHeaders)