package main

import (
	"backend/handler"
	"backend/middleware"
	"log"

	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	router := gin.Default()

	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length", "Set-Cookie"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	enforcer, err := middleware.InitCasbin()
	if err != nil {
		log.Fatalf("Casbin init failed: %v", err)
	}

	router.GET("/home", middleware.RequireKratosSession(), handler.HomePage)

	router.GET("/login/github", handler.GitHubLogin)
	router.GET("/github/callback", handler.GitHubCallback)
	router.GET("/github/repos", middleware.AuthorizationMiddleware(enforcer), handler.GitHubRepos)
	router.POST("/github/repos", middleware.AuthorizationMiddleware(enforcer), handler.CreateRepoHandler)

	router.POST("/logout", handler.Logout)

	router.GET("/protected", middleware.AuthorizationMiddleware(enforcer), handler.HomePage)
	router.GET("/api/admin/identities", handler.GetIdentities)

	router.Run(":8080")
}
