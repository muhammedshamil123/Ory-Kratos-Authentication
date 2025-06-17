package main

import (
	"backend/handler"
	"backend/middleware"

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

	router.GET("/home", middleware.RequireKratosSession(), handler.HomePage)
	router.GET("/login/github", handler.GitHubLogin)
	router.GET("/github/callback", handler.GitHubCallback)
	router.GET("/github/repos", handler.GitHubRepos)
	router.POST("/github/create-repo", handler.CreateRepoHandler)
	router.POST("/logout", handler.Logout)

	router.GET("/api/admin/identities", handler.GetIdentities)

	router.Run(":8080")
}
