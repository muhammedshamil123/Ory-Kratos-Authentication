package handler

import (
	"backend/db"
	"backend/models"
	"context"
	"net/http"
	"time"

	"github.com/casbin/casbin/v2"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

func CreateOrganizationHandler(enforcer *casbin.Enforcer) gin.HandlerFunc {
	return func(c *gin.Context) {
		var input struct {
			Name        string `json:"name" binding:"required"`
			Description string `json:"description" binding:"required"`
		}

		if err := c.ShouldBindJSON(&input); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization data"})
			return
		}
		user, exists := c.Get("user")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
			return
		}

		userID := user.(models.Identity).ID
		if userID == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		org := models.Organization{
			Name:        input.Name,
			Description: input.Description,
			CreatedBy:   userID,
			CreatedAt:   time.Now(),
		}

		collection := db.GetOrgCollection()
		res, err := collection.InsertOne(context.TODO(), org)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create organization"})
			return
		}

		orgID := res.InsertedID.(primitive.ObjectID).Hex()

		ok, err := enforcer.AddPolicy("admin", orgID, "/orgs/get/"+orgID, "GET")
		if err != nil || !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign policy"})
			return
		}
		ok, err = enforcer.AddGroupingPolicy(userID, "admin", orgID)
		if err != nil || !ok {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to assign role"})
			return
		}
		org.ID = res.InsertedID.(primitive.ObjectID)

		c.JSON(http.StatusOK, org)
	}
}

func GetAdminOrgs(c *gin.Context) {
	user, exists := c.Get("user")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found in context"})
		return
	}

	userID := user.(models.Identity).ID
	if userID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	collection := db.GetOrgCollection()
	filter := map[string]interface{}{
		"created_by": userID,
	}
	cursor, err := collection.Find(context.TODO(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve organizations"})
		return
	}
	defer cursor.Close(context.TODO())

	var orgs []models.Organization
	if err := cursor.All(context.TODO(), &orgs); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to decode organizations"})
		return
	}

	c.JSON(http.StatusOK, orgs)
}

func GetOrgByIDHandler(c *gin.Context) {
	orgID := c.Param("id")
	objectID, err := primitive.ObjectIDFromHex(orgID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid organization ID"})
		return
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	var org models.Organization
	orgsCollection := db.GetOrgCollection()
	err = orgsCollection.FindOne(ctx, bson.M{"_id": objectID}).Decode(&org)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			c.JSON(http.StatusNotFound, gin.H{"error": "Organization not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	c.JSON(http.StatusOK, org)
}
