package handler

import (
	"io"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetIdentities(c *gin.Context) {

	resp, err := http.Get("http://localhost:4434/admin/identities")
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Kratos"})
		return
	}
	defer resp.Body.Close()

	c.Status(resp.StatusCode)
	c.Header("Content-Type", "application/json")
	io.Copy(c.Writer, resp.Body)
}
