Security Policy

Overview

Security is an important consideration in the design and maintenance of kwiQeat.

The application uses multiple layers of protection to safeguard user accounts, application resources and sensitive information.

Authentication

* Passwords are hashed using bcrypt.
* Protected API endpoints require authentication.
* JWTs are verified by backend middleware.
* Inactive or suspended accounts cannot access protected resources.

Authorization

The application uses role-based access control.

Supported roles:

* Customer
* Restaurant
* Administrator

Restaurant resources are protected using ownership checks to prevent unauthorized access to another restaurant’s information.

Input Validation

Incoming requests should be validated before business logic is executed.

Invalid input should be rejected with appropriate HTTP status codes.

Database Security

* Parameterized SQL queries should be used.
* Database credentials must not be committed to version control.
* Database access should be restricted to authorized services.
* Sensitive database operations should use transactions where appropriate.

Environment Variables

Sensitive credentials must be stored outside the source code.

Examples include:

* DATABASE_URL
* JWT_SECRET
* CLOUDINARY_API_SECRET
* PAYSTACK_SECRET_KEY

Local .env files must be excluded from Git tracking.

Production credentials must be configured through the hosting provider’s environment-variable settings.

File Upload Security

Uploaded images should be restricted by file type and size.

Only supported image formats should be accepted.

Payment Security

Payment confirmation must be performed by the backend.

The frontend must never be trusted to declare a transaction successful.

Payment webhooks must be authenticated through signature verification.

Reporting Vulnerabilities

Security vulnerabilities should be reported privately to the project maintainer.

Do not publish sensitive credentials, personal information or exploitable vulnerabilities in public issue reports.
