package handler

import (
	"backend/db"
	"backend/models"
	"backend/temporal/workflows"
	"backend/utils"
	"context"
	"errors"
	"fmt"
	"net/http"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.temporal.io/sdk/client"
	"go.temporal.io/sdk/temporal"
)

func InviteUserHandler(temporalClient client.Client) gin.HandlerFunc {
	return func(c *gin.Context) {
		var req models.InviteRequest
		if err := c.BindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
			return
		}
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}
		workflowID := fmt.Sprintf("novu-invite-%s", uuid.NewString())
		we, err := temporalClient.ExecuteWorkflow(
			context.Background(),
			client.StartWorkflowOptions{
				ID:        workflowID,
				TaskQueue: "NOVU_INVITE_QUEUE",
			},
			workflows.NovuInviteWorkflow,
			models.CreateInvite{
				OrgID:       req.OrgID,
				OrgName:     req.OrgName,
				Email:       req.Email,
				Description: req.Description,
				UserId:      user.(models.Identity).ID,
			},
		)
		if err != nil {
			fmt.Println("execution error")
			var appErr *temporal.ApplicationError
			if errors.As(err, &appErr) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": appErr.Message()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		var done bool
		if err := we.Get(context.Background(), &done); err != nil {
			var appErr *temporal.ApplicationError
			if errors.As(err, &appErr) {
				c.JSON(http.StatusInternalServerError, gin.H{"error": appErr.Message()})
				return
			}
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// end

		// novuKey := os.Getenv("NOVU_API_KEY")
		// if novuKey == "" {
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Missing Novu API key"})
		// 	return
		// }

		// payload := map[string]interface{}{
		// 	"to": map[string]interface{}{
		// 		"subscriberId": req.Email,
		// 		"email":        req.Email,
		// 	},
		// 	"name": "org-invite-notification",
		// 	"payload": map[string]string{
		// 		"orgId":       req.OrgID,
		// 		"orgName":     req.OrgName,
		// 		"description": req.Description,
		// 	},
		// }

		// jsonPayload, _ := json.Marshal(payload)
		// reqURL := "https://api.novu.co/v1/events/trigger"
		// httpReq, _ := http.NewRequest("POST", reqURL, bytes.NewBuffer(jsonPayload))
		// httpReq.Header.Set("Authorization", "ApiKey "+novuKey)
		// httpReq.Header.Set("Content-Type", "application/json")

		// client := &http.Client{}
		// res, err := client.Do(httpReq)
		// if err != nil || res.StatusCode >= 400 {
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send Novu invite"})
		// 	return
		// }
		// defer res.Body.Close()
		// resp, err := http.Get("http://localhost:4434/admin/identities")
		// if err != nil {
		// 	log.Fatalf("Failed to fetch identities: %v", err)
		// }
		// defer resp.Body.Close()

		// if resp.StatusCode != http.StatusOK {
		// 	log.Fatalf("Non-OK HTTP status: %s", resp.Status)
		// }

		// bodyBytes, err := ioutil.ReadAll(resp.Body)
		// if err != nil {
		// 	log.Fatalf("Failed to read body: %v", err)
		// }

		// var identities []map[string]interface{}
		// if err := json.Unmarshal(bodyBytes, &identities); err != nil {
		// 	log.Fatalf("Failed to unmarshal JSON: %v", err)
		// }

		// targetEmail := req.Email
		// id := ""
		// found := false
		// for _, identity := range identities {
		// 	traits, ok := identity["traits"].(map[string]interface{})
		// 	if !ok {
		// 		continue
		// 	}

		// 	email, ok := traits["email"].(string)
		// 	if ok && email == targetEmail {
		// 		found = true
		// 		id = identity["id"].(string)
		// 		break
		// 	}
		// }
		// if !found {
		// 	c.JSON(http.StatusNotFound, gin.H{"error": "User with this email not found"})
		// 	return
		// }
		// if id == user.(models.Identity).ID {
		// 	c.JSON(http.StatusBadRequest, gin.H{"error": "You cannot invite yourself"})
		// 	return
		// }
		// _, err = enforcer.AddGroupingPolicy(id, "invite", req.OrgID)
		// if err != nil {
		// 	c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		// 	return
		// }

		c.JSON(http.StatusOK, gin.H{"message": "Invite sent successfully"})
	}
}

func AcceptInviteHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {

	return func(c *gin.Context) {
		orgID := c.Param("id")

		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		newUser := models.User{
			ID:    user.(models.Identity).ID,
			Email: user.(models.Identity).Traits.Email,
			Name:  user.(models.Identity).Traits.Name,
			Role:  "reader",
		}
		collection := db.GetOrgCollection()

		objID, err := primitive.ObjectIDFromHex(orgID)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
			return
		}

		var orgDoc struct {
			Name string `bson:"name"`
		}
		if err := collection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&orgDoc); err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
			return
		}

		filter := bson.M{"_id": objID}
		update := bson.M{
			"$addToSet": bson.M{"users": newUser},
		}
		_, err = collection.UpdateOne(context.TODO(), filter, update)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add user"})
			return
		}
		oldRoles := enforcer.GetRolesForUserInDomain(newUser.ID, orgID)
		for _, role := range oldRoles {
			_, _ = enforcer.DeleteRoleForUserInDomain(newUser.ID, role, orgID)
		}
		ok, err := enforcer.AddGroupingPolicy(newUser.ID, "reader", orgID)
		if err != nil || !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role"})
			return
		}

		err = utils.TriggerInviteAcceptedNotification(newUser.Email, orgID, orgDoc.Name)
		if err != nil {
			fmt.Printf("Warning: Failed to send Novu accepted notification: %v\n", err)
		}

		fmt.Println("User", newUser.Email, "added to org", orgID)
		c.Header("Content-Type", "application/json")
		c.JSON(http.StatusOK, gin.H{"message": "User added to organization successfully"})
	}
}
