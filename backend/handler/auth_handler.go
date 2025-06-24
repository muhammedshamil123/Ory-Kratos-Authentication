package handler

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

type RegisterRequest struct {
	Flow string                 `json:"flow"`
	Data map[string]interface{} `json:"data"`
}

func RegisterHandler(e *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req RegisterRequest

		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request format"})
			return
		}

		body, err := json.Marshal(req.Data)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to encode data"})
			return
		}

		kratosRespBody, statusCode, err := callKratosRegistration(req.Flow, body, c.Request.Cookies(), "http://localhost:4433")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if statusCode == http.StatusOK || statusCode == http.StatusCreated {
			if userID, err := extractUserID(kratosRespBody); err == nil {
				if err := assignDefaultRole(e, userID); err != nil {
					fmt.Println("Role assignment error:", err)
				}
			}
		}

		c.Data(statusCode, "application/json", kratosRespBody)
	}
}

func callKratosRegistration(flow string, body []byte, cookies []*http.Cookie, baseURL string) ([]byte, int, error) {
	url := fmt.Sprintf("%s/self-service/registration?flow=%s", baseURL, flow)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(body))
	if err != nil {
		return nil, 0, fmt.Errorf("failed to create Kratos request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	for _, cookie := range cookies {
		req.AddCookie(cookie)
	}

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to send request to Kratos: %w", err)
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, fmt.Errorf("failed to read response: %w", err)
	}

	return respBody, resp.StatusCode, nil
}

func extractUserID(body []byte) (string, error) {
	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return "", fmt.Errorf("invalid JSON response: %w", err)
	}

	identity, ok := data["identity"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("missing or invalid 'identity'")
	}

	id, ok := identity["id"].(string)
	if !ok {
		return "", fmt.Errorf("missing or invalid id")
	}

	return id, nil
}

func assignDefaultRole(e *casbin.Enforcer, userID string) error {
	dom := "main"
	hasRole, err := e.GetRoleManager().HasLink(userID, "reader", dom)
	if err != nil {
		return fmt.Errorf("failed to check user role: %w", err)
	}

	if hasRole {
		fmt.Println("User already has role 'reader'")
		return nil
	}

	_, err = e.AddGroupingPolicy(userID, "reader", dom)
	if err != nil {
		return fmt.Errorf("failed to assign role: %w", err)
	}
	_ = e.SavePolicy()

	return nil
}

func OIDCLoginRedirectHandler(c *gin.Context) {
	provider := "google"

	// Step 1: Create login flow
	kratosLoginFlowURL := "http://localhost:4433/self-service/login/browser"

	// Forward cookies to maintain session
	client := &http.Client{}
	req, _ := http.NewRequest("GET", kratosLoginFlowURL, nil)
	for _, cookie := range c.Request.Cookies() {
		req.AddCookie(cookie)
	}
	resp, err := client.Do(req)
	if err != nil || resp.StatusCode != http.StatusOK {
		c.String(http.StatusInternalServerError, "Failed to start login flow")
		return
	}
	defer resp.Body.Close()

	// Parse redirect URL to get flow ID
	redirectURL := resp.Request.URL
	flowID := redirectURL.Query().Get("flow")

	// Step 2: Compose correct OIDC redirect
	oidcURL := fmt.Sprintf(
		"http://localhost:4433/self-service/login?flow=%s&provider=%s",
		flowID, provider,
	)

	log.Println("Redirecting to Kratos OIDC login:", oidcURL)
	c.Redirect(http.StatusFound, oidcURL)
}
