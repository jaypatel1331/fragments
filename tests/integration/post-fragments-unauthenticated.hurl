# Unauthenticated POST to /v1/fragments
POST http://localhost:8080/v1/fragments
# We're sending a plain text fragment
Content-Type: text/plain
# Body of the request goes in ```...``` when it's a string
```This is a fragment!```

# 1. We expect to get back an HTTP 401
HTTP/1.1 401
[Asserts]
# We expect to get back a JSON response with { "status": "error", ... }
jsonpath "$.status" == "error"
# We expect to get back a JSON response with { ..., "error": "401", ... }
jsonpath "$.error.code" == 401
# We expect to get back a JSON response with { ..., "message": "Unauthorized", ... }
jsonpath "$.error.message" == "Unauthorized"
