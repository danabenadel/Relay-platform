package main

import (
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

const JWT_SECRET = "test-secret"

type User struct {
	ID           int       `json:"id"`
	Email        string    `json:"email"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"`
	CreatedAt    time.Time `json:"created_at"`
}

var users []User
var userIDCounter = 1

func hashPassword(password string) (string, error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), 12)
	return string(bytes), err
}

func verifyPassword(password, hash string) bool {
	err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
	return err == nil
}

func createToken(userID int) (string, error) {
	claims := jwt.MapClaims{
		"user_id": userID,
		"exp":     time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(JWT_SECRET))
}

func main() {
	gin.SetMode(gin.ReleaseMode)
	r := gin.Default()
	
	r.Use(cors.Default())

	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message":   "Go POC",
			"timestamp": time.Now().UnixMilli(),
			"version":   "1.0.0",
		})
	})

	r.POST("/register", func(c *gin.Context) {
		var req struct {
			Email    string `json:"email" binding:"required"`
			Username string `json:"username" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing fields"})
			return
		}

		if len(req.Password) < 6 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Password too short"})
			return
		}

		for _, user := range users {
			if user.Email == req.Email {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Email already exists"})
				return
			}
		}

		hashedPassword, _ := hashPassword(req.Password)

		user := User{
			ID:           userIDCounter,
			Email:        req.Email,
			Username:     req.Username,
			PasswordHash: hashedPassword,
			CreatedAt:    time.Now(),
		}

		users = append(users, user)
		userIDCounter++

		token, _ := createToken(user.ID)

		c.JSON(http.StatusCreated, gin.H{
			"access_token": token,
			"token_type":   "bearer",
			"user": gin.H{
				"id":       user.ID,
				"email":    user.Email,
				"username": user.Username,
			},
		})
	})

	r.POST("/login", func(c *gin.Context) {
		var req struct {
			Email    string `json:"email" binding:"required"`
			Password string `json:"password" binding:"required"`
		}

		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Missing fields"})
			return
		}

		var user *User
		for i := range users {
			if users[i].Email == req.Email {
				user = &users[i]
				break
			}
		}

		if user == nil || !verifyPassword(req.Password, user.PasswordHash) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
			return
		}

		token, _ := createToken(user.ID)

		c.JSON(http.StatusOK, gin.H{
			"access_token": token,
			"token_type":   "bearer",
			"user": gin.H{
				"id":       user.ID,
				"email":    user.Email,
				"username": user.Username,
			},
		})
	})

	r.GET("/profile", func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "No token"})
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(JWT_SECRET), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid claims"})
			return
		}

		userID := int(claims["user_id"].(float64))
		
		var user *User
		for i := range users {
			if users[i].ID == userID {
				user = &users[i]
				break
			}
		}

		if user == nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
			return
		}

		c.JSON(http.StatusOK, gin.H{
			"id":         user.ID,
			"email":      user.Email,
			"username":   user.Username,
			"created_at": user.CreatedAt,
		})
	})

	r.GET("/about.json", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"client": gin.H{"host": c.ClientIP()},
			"server": gin.H{
				"current_time": time.Now().Unix(),
				"services": []gin.H{
					{
						"name": "gmail",
						"actions": []gin.H{
							{"name": "new_email", "description": "New email received"},
						},
						"reactions": []gin.H{
							{"name": "send_email", "description": "Send an email"},
						},
					},
				},
			},
		})
	})

	fmt.Println(" Go server starting on http://localhost:8082")
	r.Run(":8082")
}
