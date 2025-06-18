package middleware

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/casbin/casbin/v2/model"
	fileadapter "github.com/casbin/casbin/v2/persist/file-adapter"
	"github.com/gin-gonic/gin"
)

type Identity struct {
	ID     string `json:"id"`
	Traits struct {
		Email string `json:"email"`
		Name  string `json:"name"`
		Role  string `json:"role"`
	} `json:"traits"`
}

func InitCasbin() (*casbin.Enforcer, error) {
	m, err := model.NewModelFromFile("model.config")
	if err != nil {
		return nil, err
	}
	a := fileadapter.NewAdapter("policy.csv")
	e, err := casbin.NewEnforcer(m, a)
	if err != nil {
		return nil, err
	}
	err = e.LoadPolicy()
	if err != nil {
		return nil, err
	}
	return e, nil
}

func AuthorizationMiddleware(e *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {

		cookie, err := c.Request.Cookie("ory_kratos_session")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing session cookie"})
			return
		}

		req, err := http.NewRequest("GET", "http://localhost:4433/sessions/whoami", nil)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}
		req.Header.Set("Cookie", "ory_kratos_session="+cookie.Value)

		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil || res.StatusCode != 200 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			return
		}
		defer res.Body.Close()

		var session struct {
			Identity Identity `json:"identity"`
		}
		if err := json.NewDecoder(res.Body).Decode(&session); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode session"})
			return
		}
		fmt.Println(session.Identity.ID)

		user := session.Identity.ID
		obj := c.Request.URL.Path
		act := c.Request.Method

		ok, err := e.Enforce(user, obj, act)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
			return
		}
		fmt.Println(user, obj, act)
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}
		c.Set("user", session.Identity)
		c.Next()
	}
}

func RequireKratosSession() gin.HandlerFunc {
	return func(c *gin.Context) {
		cookie, err := c.Request.Cookie("ory_kratos_session")
		if err != nil {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Missing session cookie"})
			return
		}

		req, err := http.NewRequest("GET", "http://localhost:4433/sessions/whoami", nil)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request"})
			return
		}
		req.Header.Set("Cookie", "ory_kratos_session="+cookie.Value)

		client := &http.Client{}
		res, err := client.Do(req)
		if err != nil || res.StatusCode != 200 {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired session"})
			return
		}
		defer res.Body.Close()

		var session struct {
			Identity Identity `json:"identity"`
		}
		if err := json.NewDecoder(res.Body).Decode(&session); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode session"})
			return
		}
		c.Set("user", session.Identity)
		c.Next()
	}
}
