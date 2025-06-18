package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/go-github/v55/github"
	"golang.org/x/oauth2"
)

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

func CreateRepoHandler(c *gin.Context) {
	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Private     bool   `json:"private"`
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"message": "Invalid input"})
		return
	}

	token, err := c.Cookie("github_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing GitHub token"})
		return
	}

	client := oauth2.NewClient(context.Background(), oauth2.StaticTokenSource(
		&oauth2.Token{AccessToken: token},
	))

	repo := &github.Repository{
		Name:        github.String(body.Name),
		Description: github.String(body.Description),
		Private:     github.Bool(body.Private),
	}

	createdRepo, _, err := github.NewClient(client).Repositories.Create(context.Background(), "", repo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"message": err.Error()})
		return
	}

	c.JSON(http.StatusOK, createdRepo)
}
