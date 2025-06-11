package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/github"
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
		Endpoint:     github.Endpoint,
	}
}

func HomePage(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status": "success",
		"user":   user,
	})
}

func Logout(c *gin.Context) {
	req, _ := http.NewRequest("GET", "http://localhost:4433/self-service/logout/browser", nil)

	for _, cookie := range c.Request.Cookies() {
		req.AddCookie(cookie)
	}

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil || res.StatusCode != http.StatusOK {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to logout via Kratos"})
		return
	}
	defer res.Body.Close()

	var resData struct {
		LogoutURL string `json:"logout_url"`
	}

	if err := json.NewDecoder(res.Body).Decode(&resData); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to Decode"})
		return
	}

	if resData.LogoutURL == "" {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "LOgout url not recieved"})
		return
	}

	c.SetCookie("github_token", "", -1, "/", "localhost", false, true)

	c.JSON(http.StatusOK, gin.H{"logout_url": resData.LogoutURL})
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

func GitHubRepos(c *gin.Context) {
	token, err := c.Cookie("github_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing GitHub token"})
		return
	}
	req, _ := http.NewRequest("GET", "https://api.github.com/user/repos", nil)
	req.Header.Set("Authorization", "token "+token)

	resp, err := http.DefaultClient.Do(req)
	if err != nil || resp.StatusCode != 200 {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch repos"})
		return
	}
	defer resp.Body.Close()

	var repos []map[string]interface{}
	json.NewDecoder(resp.Body).Decode(&repos)

	c.JSON(http.StatusOK, repos)
}
