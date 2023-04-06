#!/bin/sh

# Setup steps for working with LocalStack and DynamoDB local instead of AWS.
# Assumes aws cli is installed and LocalStack and DynamoDB local are running.

# Setup AWS environment variables
echo "Setting AWS environment variables for LocalStack"

echo "AWS_ACCESS_KEY_ID=test"
export AWS_ACCESS_KEY_ID=ASIA54TTW6INY6Y4BSD5

echo "AWS_SECRET_ACCESS_KEY=test"
export AWS_SECRET_ACCESS_KEY=rvkVg3l4NJfhtdvCBoZ+08mAo63kQkleY69axPT2

echo "AWS_SESSION_TOKEN=test"
export AWS_SESSION_TOKEN=FwoGZXIvYXdzEF8aDNaKI/y9lz+Gn/njuyLGAVIY8pPMa6IaSX0abjexv0hE3CUBgVQmvZZotsTPPyAAA/YXX8bQwmHjBwOH5Oz1tukoRbsAfVqUUHIFwsLIeG4Q+0AE+BecCOB3rIHRninxz2Rhe9RkIS6fXm/4LftTTyL6k8THuXUtXvZBiZ1FFNwaFO2Jj3xZrcCqdaKnziXSC1atDulmX2imQZSsfxWhh3Pxbsp9wQjRKYG2kTNcz73UAm3BTJm4k2FgV9rEuZ4KbyC1EroqGiYVTy93a3eE2knFhMbkbSj9/7yhBjItSNDKcFkop1HmC9W2KyQdIkZaT/CHv1gnNFVocqkQUQZjwEnhO7M4TMmmnn+Y

export AWS_DEFAULT_REGION=us-east-1
echo "AWS_DEFAULT_REGION=us-east-1"

# Wait for LocalStack to be ready, by inspecting the response from /health, see:
# https://github.com/localstack/localstack/issues/4904#issuecomment-966315170
echo 'Waiting for LocalStack S3...'
until (curl --silent http://localhost:4566/health | grep "\"s3\": \"\(running\|available\)\"" > /dev/null); do
    sleep 5
done
echo 'LocalStack S3 Ready'

# Create our S3 bucket with LocalStack
echo "Creating LocalStack S3 bucket: fragments"
aws --endpoint-url=http://localhost:4566 s3api create-bucket --bucket fragments

# Setup DynamoDB Table with dynamodb-local, see:
# https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/getting-started-step-1.html
echo "Creating DynamoDB-Local DynamoDB table: fragments"
aws --endpoint-url=http://localhost:8000 \
dynamodb create-table \
    --table-name fragments \
    --attribute-definitions \
        AttributeName=ownerId,AttributeType=S \
        AttributeName=id,AttributeType=S \
    --key-schema \
        AttributeName=ownerId,KeyType=HASH \
        AttributeName=id,KeyType=RANGE \
    --provisioned-throughput \
        ReadCapacityUnits=10,WriteCapacityUnits=5

# Wait until the Fragments table exists in dynamodb-local, so we can use it, see:
# https://awscli.amazonaws.com/v2/documentation/api/latest/reference/dynamodb/wait/table-exists.html
aws --endpoint-url=http://localhost:8000 dynamodb wait table-exists --table-name fragments
