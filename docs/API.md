API Reference

Overview

The kwiQeat backend exposes RESTful HTTP endpoints for customer, restaurant and administrative operations.

Base URL

Production:

https://kwiqeat-api.onrender.com/api

Local:

http://localhost:10000/api

Authentication

Protected endpoints require a valid JWT.

Include the token in the Authorization header:

Authorization: Bearer <access_token>

Response Format

Successful responses generally follow this structure:

{
  "success": true,
  "message": "Request completed successfully",
  "data": {}
}

Error responses should provide a meaningful message and appropriate HTTP status code.

1. Authentication

Method	Endpoint	Description	Access
POST	/auth/register	Register customer	Public
POST	/auth/login	Authenticate user	Public
GET	/auth/me	Retrieve current user	Authenticated

2. Restaurants

Method	Endpoint	Description	Access
POST	/restaurants/register	Register restaurant	Public
GET	/restaurants/public	List active restaurants	Public
GET	/restaurants/my-restaurant	Retrieve owned restaurant	Restaurant
PUT	/restaurants/my-restaurant	Update restaurant profile	Restaurant
PATCH	/restaurants/my-restaurant/availability	Update availability	Restaurant
GET	/restaurants/admin/all	List restaurants	Admin
PATCH	/restaurants/admin/:id/status	Update approval status	Admin

3. Menu

Method	Endpoint	Description	Access
GET	/menu/public/:slug	Retrieve public restaurant menu	Public
GET	/menu	Retrieve owned restaurant menu	Restaurant
POST	/menu	Create food item	Restaurant
PUT	/menu/:id	Update food item	Restaurant
DELETE	/menu/:id	Delete food item	Restaurant

4. Orders

Method	Endpoint	Description	Access
POST	/orders	Create order	Customer
GET	/orders/my-orders	Retrieve customer orders	Customer
GET	/restaurant-orders	Retrieve restaurant orders	Restaurant
PATCH	/restaurant-orders/:id/status	Update order status	Restaurant
GET	/restaurant-orders/sales/summary	Retrieve sales summary	Restaurant

Verify each endpoint against the current route definitions before treating this table as exhaustive.

5. Administration

Method	Endpoint	Description	Access
GET	/admin/overview	Retrieve platform statistics	Admin
GET	/admin/customers	List customers	Admin
GET	/admin/orders	List platform orders	Admin
GET	/admin/categories	List categories	Admin
POST	/admin/categories	Create category	Admin

6. HTTP Status Codes

Status	Meaning
200	Request successful
201	Resource created
400	Invalid request
401	Authentication required
403	Access forbidden
404	Resource not found
409	Resource conflict
422	Validation failed
429	Too many requests
500	Internal server error

7. API Versioning

Future API versions should be introduced through versioned routes, for example:

/api/v1/restaurants

Versioning will allow changes to the API contract without unexpectedly breaking existing clients.
