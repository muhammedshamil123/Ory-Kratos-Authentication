package handler

import (
	"context"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	ghoauth "golang.org/x/oauth2/github"
)

var githubOauthConfig *oauth2.Config

func init() {
	err := godotenv.Load(".env")
	if err != nil {
		fmt.Println("Warning: .env file not found or failed to load")
	}

	clientID := os.Getenv("GITHUB_CLIENT_ID")
	clientSecret := os.Getenv("GITHUB_CLIENT_SECRET")

	githubOauthConfig = &oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Scopes:       []string{"repo"},
		RedirectURL:  "http://localhost:8080/github/callback",
		Endpoint:     ghoauth.Endpoint,
	}
}

func GitHubLogin(c *gin.Context) {

	url := githubOauthConfig.AuthCodeURL("random-state")
	c.Redirect(http.StatusTemporaryRedirect, url)
}

func GitHubCallback(c *gin.Context) {
	code := c.Query("code")
	if code == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing code"})
		return
	}
	token, err := githubOauthConfig.Exchange(context.Background(), code)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to exchange code"})
		return
	}

	c.SetCookie("github_token", token.AccessToken, 3600, "/", "localhost", false, true)
	c.Redirect(http.StatusSeeOther, "http://localhost:3000")
}
