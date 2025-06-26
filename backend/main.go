package main

import (
	"backend/db"
	"backend/handler"
	"backend/middleware"
	"log"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db.ConnectDB("mongodb://localhost:27017")
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
		authGroup.POST("/orgs/create", handler.CreateOrganizationHandler(enforcer))
		authGroup.GET("/orgs/get", handler.GetAdminOrgs)
		authGroup.GET("/orgs/get-all", handler.GetUserOrgs)
		authGroup.GET("/orgs/get/:id", handler.GetOrgByIDHandler)
		authGroup.POST("/orgs/invite/:id", handler.InviteUserHandler(enforcer))
		authGroup.GET("/orgs/accept/:id", handler.AcceptInviteHandler(enforcer))
		authGroup.POST("/orgs/update-role/:id", handler.UpdateUserRoleInOrgHandler(enforcer))
	}

	router.Run(":8080")
}
