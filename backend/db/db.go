package db

import (
	"context"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var MongoClient *mongo.Client

func ConnectDB(uri string) error {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(uri))
	if err != nil {
		return err
	}

	// Optional: Ping the database to make sure it's alive
	if err := client.Ping(ctx, nil); err != nil {
		return err
	}

	MongoClient = client
	return nil
}

func GetOrgCollection() *mongo.Collection {
	return MongoClient.Database("casbin").Collection("organizations")
}
