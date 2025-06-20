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

	router.POST("/logout", handler.Logout)
	router.POST("/api/register", handler.RegisterHandler(enforcer))
	router.GET("/auth/oidc/google", handler.OIDCLoginRedirectHandler)

	authGroup := router.Group("/")
	authGroup.Use(middleware.AuthorizationMiddleware(enforcer))
	{
		authGroup.GET("/home", handler.HomePage)
		authGroup.GET("/login/github", handler.GitHubLogin)
		authGroup.GET("/github/callback", handler.GitHubCallback)
		authGroup.GET("/github/repos", handler.GitHubRepos)
		authGroup.POST("/github/repos", handler.CreateRepoHandler)
		authGroup.GET("/protected", handler.HomePage)
		authGroup.GET("/api/admin/identities", handler.GetIdentities(enforcer))
		authGroup.POST("/api/admin/update-role", handler.UpdateUserRole(enforcer))
	}

	router.Run(":8080")
}
