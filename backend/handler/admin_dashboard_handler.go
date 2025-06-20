package handler

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
)

func GetIdentities(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		resp, err := http.Get("http://localhost:4434/admin/identities")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Kratos"})
			return
		}
		defer resp.Body.Close()

		var data []map[string]any
		if err := json.NewDecoder(resp.Body).Decode(&data); err != nil {
			fmt.Println(err)
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode session"})
			return
		}

		for _, val := range data {
			id, ok := val["id"].(string)
			if !ok {
				val["role"] = []string{"unknown"}
				continue
			}

			roles, err := enforcer.GetRolesForUser(id)
			if err != nil {
				fmt.Printf("Failed to get roles for user %s: %v\n", id, err)
				val["role"] = []string{"error"}
				continue
			}

			if len(roles) == 0 {
				val["role"] = []string{"none"}
			} else {
				val["role"] = roles[0]
			}
		}

		c.JSON(resp.StatusCode, gin.H{"data": data})
	}
}

func UpdateUserRole(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req struct {
			UserID string `json:"user_id"`
			Role   string `json:"role"`
		}
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}

		oldRoles, _ := enforcer.GetRolesForUser(req.UserID)
		for _, role := range oldRoles {
			_, _ = enforcer.DeleteRoleForUser(req.UserID, role)
		}

		_, err := enforcer.AddRoleForUser(req.UserID, req.Role)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update role"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "Role updated"})
	}
}
