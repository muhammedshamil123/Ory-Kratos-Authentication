package middleware

import (
	"backend/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/casbin/casbin/v2"
	mongodbadapter "github.com/casbin/mongodb-adapter/v3"
	"github.com/gin-gonic/gin"
)

func InitCasbin() (*casbin.Enforcer, error) {

	adapter, err := mongodbadapter.NewAdapter("mongodb://localhost:27017/casbin")
	if err != nil {
		log.Fatalf("failed to create adapter: %v", err)
	}
	enforcer, err := casbin.NewEnforcer("model.config", adapter)
	if err != nil {
		log.Fatalf("failed to create enforcer: %v", err)
	}

	if err := enforcer.LoadPolicy(); err != nil {
		return nil, err
	}
	// seedPolicy(enforcer)
	return enforcer, nil
}

func seedPolicy(e *casbin.Enforcer) {

	// _, _ = e.AddPolicy("reader", "main", "/home", "GET")
	// _, _ = e.AddPolicy("reader", "main", "/login/github", "GET")
	// _, _ = e.AddPolicy("reader", "main", "/github/callback", "GET")
	// _, _ = e.AddPolicy("admin", "main", "/api/admin/update-role", "POST")
	// _, _ = e.AddPolicy("admin", "main", "/api/admin/identities", "GET")
	// _, _ = e.AddPolicy("admin", "main", "/protected", "GET")
	// _, _ = e.AddPolicy("writer", "main", "/github/repos", "POST")
	// _, _ = e.AddPolicy("reader", "main", "/github/repos", "GET")
	// _, _ = e.AddPolicy("reader", "main", "/orgs/create", "POST")
	// _, _ = e.AddPolicy("reader", "main", "/orgs/get", "GET")
	// _, _ = e.AddPolicy("reader", "main", "/orgs/get-all", "GET")

	// // Role hierarchy
	// _, _ = e.AddGroupingPolicy("admin", "writer", "main")
	// _, _ = e.AddGroupingPolicy("writer", "reader", "main")

	// // Map users (UUIDs from Kratos) to roles
	// _, _ = e.AddGroupingPolicy("5a833c71-e6e8-4388-9c7c-39ac8a00055d", "admin", "main")
	// _, _ = e.AddGroupingPolicy("6f652339-2ee8-4330-8a0f-47bd3214bea9", "reader", "main")
	// _, _ = e.AddGroupingPolicy("2162fe0d-dd24-4530-80ae-ee6d9baadf50", "writer", "main")

	// _ = e.SavePolicy()
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
			Identity models.Identity `json:"identity"`
		}
		if err := json.NewDecoder(res.Body).Decode(&session); err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode session"})
			return
		}

		user := session.Identity.ID
		obj := c.Request.URL.Path
		act := c.Request.Method
		dom := c.Param("id")
		if dom == "" {
			dom = "main"
		}
		roles := e.GetRolesForUserInDomain(user, dom)
		// fmt.Println("Roles for user:", user, "in domain:", dom, "are:", roles)
		role := ""
		if len(roles) > 0 {
			role = roles[0]
		} else {
			hasGroup, _ := e.GetRoleManager().HasLink(user, "reader", dom)
			if !hasGroup {
				_, err = e.AddGroupingPolicy(user, "reader", dom)
				if err != nil {
					fmt.Println("failed to assign role:", err)
					return
				}
				_ = e.SavePolicy()
			}
			role = "reader"
		}

		ok, err := e.Enforce(user, dom, obj, act)
		// fmt.Println("Enforce result:", ok, "for user:", user, "role:", role, "object:", obj, "action:", act, "domain:", dom)
		if err != nil {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Internal error"})
			return
		}
		if !ok {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{"error": "Access denied"})
			return
		}

		c.Set("user", session.Identity)
		c.Set("role", role)
		c.Next()
	}
}
