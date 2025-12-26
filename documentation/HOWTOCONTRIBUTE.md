# How to Contribute to AREA Project

![EPITECH](https://img.shields.io/badge/EPITECH-2025-blue)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-brightgreen)

Thank you for considering contributing to the AREA (Action-REAction) project! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Environment Setup](#development-environment-setup)
4. [Project Structure](#project-structure)
5. [Contribution Workflow](#contribution-workflow)
6. [Coding Standards](#coding-standards)
7. [Adding New Features](#adding-new-features)
8. [Testing Guidelines](#testing-guidelines)
9. [Documentation](#documentation)
10. [Pull Request Process](#pull-request-process)
11. [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors, regardless of experience level, background, or identity.

### Expected Behavior

- Be respectful and considerate in all interactions
- Provide constructive feedback
- Accept constructive criticism gracefully
- Focus on what is best for the project and community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling or inflammatory remarks
- Publishing others' private information without permission
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ (LTS recommended)
- **Docker** and **Docker Compose**
- **Git**
- **PostgreSQL** 14+ (if running locally without Docker)
- **A code editor** (VS Code recommended)

### Fork and Clone

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/G-DEV-500-PAR-5-1-area-8.git
   cd G-DEV-500-PAR-5-1-area-8
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/EpitechPGE3-2025/G-DEV-500-PAR-5-1-area-8.git
   ```

4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

---

## Development Environment Setup

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Generate RSA keys for JWT**:
   ```bash
   mkdir -p keys
   ssh-keygen -t rsa -b 4096 -m PEM -f keys/private.key -N ""
   openssl rsa -in keys/private.key -pubout -outform PEM -out keys/public.key
   ```

5. **Setup database**:
   ```bash
   npx prisma migrate dev
   npx prisma db seed  # if seed script available
   ```

6. **Start development server**:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

### Using Docker (Recommended)

1. **Build all services**:
   ```bash
   docker compose build
   ```

2. **Start all services**:
   ```bash
   docker compose up -d
   ```

3. **View logs**:
   ```bash
   docker logs area_server -f
   ```

4. **Stop services**:
   ```bash
   docker compose down
   ```

---

## Project Structure

```
G-DEV-500-PAR-5-1-area-8/
├── backend/
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   ├── controllers/      # Route controllers
│   │   ├── middleware/       # Express middleware
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── repositories/     # Database access layer
│   │   ├── utils/            # Utility functions
│   │   └── types/            # TypeScript types
│   ├── microservices/
│   │   ├── timer/            # Timer service
│   │   ├── google/           # Google service (Gmail, Drive)
│   │   ├── discord/          # Discord service
│   │   ├── spotify/          # Spotify service
│   │   ├── reddit/           # Reddit service
│   │   ├── github/           # GitHub service
│   │   ├── openai/           # OpenAI service
│   │   └── onedrive/         # OneDrive service
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Database migrations
│   ├── swagger.yaml          # API documentation
│   └── package.json
│
├── frontend/
│   ├── pages/                # Nuxt.js pages
│   ├── components/           # Vue components
│   ├── composables/          # Vue composables
│   ├── stores/               # Pinia stores
│   ├── assets/               # Static assets
│   └── package.json
│
├── docker-compose.yml        # Docker configuration
├── README.md                 # Project documentation
├── HOWTOCONTRIBUTE.md        # This file
└── BACKEND_DOCUMENTATION.md  # Backend technical docs
```

---

## Contribution Workflow

### 1. Find or Create an Issue

- Browse existing issues or create a new one
- Discuss your proposed changes with maintainers
- Get assigned to the issue before starting work

### 2. Create a Feature Branch

```bash
git checkout main
git pull upstream main
git checkout -b feature/descriptive-name
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### 3. Make Your Changes

- Write clean, maintainable code
- Follow the coding standards (see below)
- Add tests for new functionality
- Update documentation as needed

### 4. Commit Your Changes

```bash
git add .
git commit -m "feat: add new feature description"
```

Commit message format (following Conventional Commits):
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### 5. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 6. Create a Pull Request

- Go to GitHub and create a pull request
- Fill in the PR template with all required information
- Link related issues
- Request review from maintainers

---

## Coding Standards

### General Principles

- **Write clean, readable code**
- **Follow SOLID principles**
- **Keep functions small and focused**
- **Use meaningful variable and function names**
- **Comment complex logic** (in French for this project)
- **Avoid code duplication** (DRY principle)

### TypeScript Guidelines

#### Type Safety

```typescript
// Good - Explicit types
function createUser(email: string, password: string): Promise<User> {
  // ...
}

// Bad - Implicit any
function createUser(email, password) {
  // ...
}
```

#### Interfaces and Types

```typescript
// Use interfaces for object shapes
interface User {
  id: string;
  email: string;
  createdAt: Date;
}

// Use types for unions, intersections, etc.
type ServiceType = 'internal' | 'oauth' | 'api';
```

#### Async/Await

```typescript
// Good - Use async/await
async function fetchUserData(userId: string): Promise<User> {
  try {
    const user = await userRepository.findById(userId);
    return user;
  } catch (error) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

// Bad - Callback hell
function fetchUserData(userId: string, callback) {
  userRepository.findById(userId, (error, user) => {
    if (error) {
      callback(error);
    } else {
      callback(null, user);
    }
  });
}
```

### Code Formatting

This project uses **ESLint** and **Prettier** for code formatting.

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix lint errors automatically
npm run lint:fix
```

### Naming Conventions

- **Variables and functions**: `camelCase`
  ```typescript
  const userName = 'John';
  function getUserById(id: string) { }
  ```

- **Classes and interfaces**: `PascalCase`
  ```typescript
  class UserService { }
  interface UserData { }
  ```

- **Constants**: `UPPER_SNAKE_CASE`
  ```typescript
  const MAX_RETRY_ATTEMPTS = 3;
  const API_BASE_URL = 'http://localhost:8080';
  ```

- **Files**: `kebab-case` or `PascalCase` (for components)
  ```
  user-service.ts
  AuthController.ts
  ```

### Comment Standards

- **Comments in French** for code explanations
- **English for code itself** (variable names, functions, etc.)

```typescript
// Récupère un utilisateur par son ID et vérifie ses permissions
async function getUserWithPermissions(userId: string): Promise<UserWithPermissions> {
  // Vérification que l'utilisateur existe
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Chargement des permissions associées
  const permissions = await permissionRepository.findByUserId(userId);

  return { ...user, permissions };
}
```

---

## Adding New Features

### Adding a New Microservice

Follow these steps to add a new microservice to the AREA platform:

#### 1. Create the Microservice Directory

```bash
mkdir -p backend/microservices/yourservice
cd backend/microservices/yourservice
```

#### 2. Initialize the Project

Create `package.json`:
```json
{
  "name": "area-yourservice-service",
  "version": "1.0.0",
  "main": "index.ts",
  "scripts": {
    "dev": "ts-node-dev --respawn index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "@types/express": "^4.17.17",
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "ts-node-dev": "^2.0.0"
  }
}
```

#### 3. Create the Service Implementation

Create `index.ts`:
```typescript
import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5XXX; // Choose unique port

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    service: 'YourService',
    timestamp: new Date().toISOString()
  });
});

// Action endpoints
app.post('/actions/trigger', async (req: Request, res: Response) => {
  try {
    // Implement your action logic
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reaction endpoints
app.post('/reactions/trigger', async (req: Request, res: Response) => {
  try {
    // Implement your reaction logic
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`YourService microservice running on port ${PORT}`);
});
```

#### 4. Create Dockerfile

Create `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

EXPOSE 5XXX

CMD ["npm", "run", "dev"]
```

#### 5. Add to Docker Compose

Edit `docker-compose.yml`:
```yaml
services:
  # ... existing services ...

  yourservice:
    build:
      context: ./backend/microservices/yourservice
    container_name: area_yourservice_service
    ports:
      - "5XXX:5XXX"
    environment:
      - PORT=5XXX
      - DATABASE_URL=${DATABASE_URL}
    networks:
      - area-network
    restart: unless-stopped
```

#### 6. Update Database Schema

Edit `backend/prisma/schema.prisma`:
```prisma
// Add your service to the Service table seed
// The service will be inserted via migration or seed script
```

Create a migration:
```bash
cd backend
npx prisma migrate dev --name add_yourservice
```

#### 7. Create Token Service (if OAuth required)

Create `backend/src/services/yourservice.token.service.ts`:
```typescript
import prisma from '../config/database';
import { encrypt, decrypt } from '../utils/encryption';

export class YourServiceTokenService {
  async saveTokens(userId: string, accessToken: string, refreshToken?: string) {
    const encryptedAccessToken = encrypt(accessToken);
    const encryptedRefreshToken = refreshToken ? encrypt(refreshToken) : null;

    await prisma.oAuthToken.upsert({
      where: {
        userId_serviceName: {
          userId,
          serviceName: 'yourservice',
        },
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000), // 1 hour
      },
      create: {
        userId,
        serviceName: 'yourservice',
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + 3600 * 1000),
      },
    });
  }

  async getTokens(userId: string) {
    const token = await prisma.oAuthToken.findUnique({
      where: {
        userId_serviceName: {
          userId,
          serviceName: 'yourservice',
        },
      },
    });

    if (!token) return null;

    return {
      accessToken: decrypt(token.accessToken),
      refreshToken: token.refreshToken ? decrypt(token.refreshToken) : null,
      expiresAt: token.expiresAt,
    };
  }
}
```

#### 8. Add OAuth Routes (if applicable)

Edit `backend/src/routes/Auth.Routes.ts`:
```typescript
// Add OAuth routes for your service
router.get('/oauth/yourservice', async (req, res) => {
  // Redirect to OAuth provider
});

router.get('/oauth/yourservice/callback', async (req, res) => {
  // Handle OAuth callback
});
```

#### 9. Update Documentation

- Add service documentation to `backend/BACKEND_DOCUMENTATION.md`
- Update `backend/swagger.yaml` with new endpoints
- Document actions and reactions available

#### 10. Test Your Service

```bash
# Rebuild and restart services
docker compose up -d --build yourservice

# Check logs
docker logs area_yourservice_service -f

# Test health endpoint
curl http://localhost:5XXX/health
```

### Adding a New Action or Reaction

#### Add to Database

```sql
-- Add action
INSERT INTO actions (name, description, service_id)
VALUES ('action_name', 'Action description', service_id);

-- Add reaction
INSERT INTO reactions (name, description, service_id)
VALUES ('reaction_name', 'Reaction description', service_id);
```

#### Implement in Microservice

```typescript
// In your microservice index.ts
app.post('/actions/your_action', async (req, res) => {
  const { userId, config } = req.body;

  try {
    // Implement action logic
    // Check conditions
    // Return result
    res.json({ success: true, triggered: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/reactions/your_reaction', async (req, res) => {
  const { userId, config, actionData } = req.body;

  try {
    // Implement reaction logic
    // Perform the action
    // Return result
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
```

---

## Testing Guidelines

### Unit Tests

Write unit tests for:
- Service functions
- Utility functions
- Controllers

Example using Jest:
```typescript
import { UserService } from '../services/UserService';

describe('UserService', () => {
  describe('createUser', () => {
    it('should create a new user with valid data', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };

      const user = await UserService.createUser(userData);

      expect(user).toBeDefined();
      expect(user.email).toBe(userData.email);
    });

    it('should throw error with duplicate email', async () => {
      const userData = {
        email: 'existing@example.com',
        password: 'SecurePass123!',
      };

      await expect(UserService.createUser(userData))
        .rejects
        .toThrow('Email already exists');
    });
  });
});
```

### Integration Tests

Test API endpoints:
```typescript
import request from 'supertest';
import app from '../index';

describe('Auth API', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'SecurePass123!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- UserService.test.ts

# Run in watch mode
npm test -- --watch
```

---

## Documentation

### Code Documentation

Use JSDoc/TSDoc for functions:
```typescript
/**
 * Récupère un utilisateur par son ID
 *
 * @param userId - L'identifiant unique de l'utilisateur
 * @returns Promise contenant l'utilisateur trouvé
 * @throws {NotFoundError} Si l'utilisateur n'existe pas
 *
 * @example
 * ```typescript
 * const user = await getUserById('cm123abc');
 * console.log(user.email);
 * ```
 */
async function getUserById(userId: string): Promise<User> {
  // Implementation
}
```

### API Documentation

Update `swagger.yaml` for all new endpoints:
```yaml
/api/yourservice/action:
  post:
    tags:
      - YourService
    summary: Trigger your service action
    security:
      - BearerAuth: []
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              config:
                type: object
    responses:
      '200':
        description: Action triggered successfully
      '401':
        description: Unauthorized
```

### README Updates

When adding major features, update:
- Main `README.md` - Feature list, usage examples
- `BACKEND_DOCUMENTATION.md` - Technical details, endpoints
- Service-specific READMEs if applicable

---

## Pull Request Process

### Before Submitting

1. **Self-review your code**
   - Check for console.logs or debug code
   - Ensure proper error handling
   - Verify tests pass
   - Run linter

2. **Update documentation**
   - Add/update comments
   - Update relevant markdown files
   - Update Swagger if API changed

3. **Test thoroughly**
   - Manual testing
   - Automated tests
   - Edge cases

### PR Title Format

```
<type>(<scope>): <description>

Examples:
feat(backend): add OpenAI service integration
fix(auth): resolve JWT token expiration issue
docs(readme): update installation instructions
refactor(frontend): improve component structure
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issue
Fixes #(issue number)

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests added and passing
- [ ] Dependent changes merged
```

### Review Process

1. **Automated checks must pass**
   - CI/CD pipeline
   - Linting
   - Tests

2. **At least one approval required**
   - Code review by maintainer
   - Address review comments
   - Request re-review if needed

3. **Merge**
   - Squash and merge (preferred)
   - Maintainer will merge when ready

---

## Issue Reporting

### Bug Reports

Use the bug report template:
```markdown
## Bug Description
Clear description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. Windows 11, macOS Ventura]
- Browser: [e.g. Chrome 120, Firefox 121]
- Node version: [e.g. 18.17.0]
- Docker version: [e.g. 24.0.5]

## Logs
```
Paste relevant logs here
```

## Screenshots
Add screenshots if applicable
```

### Feature Requests

```markdown
## Feature Description
Clear description of the proposed feature

## Use Case
Why is this feature needed? What problem does it solve?

## Proposed Solution
How should this feature work?

## Alternative Solutions
What other approaches have you considered?

## Additional Context
Any other relevant information
```

---

## Development Best Practices

### Security

- **Never commit secrets** (API keys, passwords, tokens)
- Use environment variables for sensitive data
- Validate and sanitize all user input
- Implement proper authentication and authorization
- Use HTTPS in production
- Keep dependencies updated

### Performance

- Optimize database queries
- Use caching where appropriate
- Minimize API calls to external services
- Implement pagination for large datasets
- Use async/await for I/O operations

### Error Handling

```typescript
// Good - Specific error handling
try {
  const user = await userService.findById(userId);

  if (!user) {
    throw new NotFoundError(`User ${userId} not found`);
  }

  return user;
} catch (error) {
  if (error instanceof NotFoundError) {
    logger.warn(`User lookup failed: ${error.message}`);
    throw error;
  }

  logger.error(`Unexpected error in user lookup: ${error}`);
  throw new InternalServerError('Failed to retrieve user');
}
```

### Logging

```typescript
import { logger } from './utils/logger';

// Log at appropriate levels
logger.info('User registered successfully', { userId: user.id });
logger.warn('Failed login attempt', { email, ip: req.ip });
logger.error('Database connection failed', { error: error.message });
logger.debug('Processing area trigger', { areaId, config });
```

---

## Getting Help

### Resources

- **Documentation**: Read `README.md` and `BACKEND_DOCUMENTATION.md`
- **Swagger**: http://localhost:8080/api-docs
- **Issues**: Search existing issues on GitHub
- **Logs**: Check Docker logs for errors

### Communication

- **GitHub Issues**: For bugs and feature requests
- **Pull Request Comments**: For code-specific discussions
- **Team Chat**: For quick questions (if applicable)

### Useful Commands

```bash
# View all running containers
docker compose ps

# Restart a specific service
docker compose restart service_name

# View service logs
docker logs area_server -f --tail 100

# Access database
docker exec -it area_database psql -U area_user -d area_db

# Run database migrations
cd backend && npx prisma migrate dev

# Generate Prisma client
npx prisma generate

# Reset database (CAUTION!)
npx prisma migrate reset
```

---

## License

By contributing to this project, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

## Thank You!

Thank you for contributing to the AREA project! Your efforts help make this platform better for everyone. If you have questions or need help, don't hesitate to reach out through GitHub issues or discussions.

---

**EPITECH Project - 2025**

*This contribution guide is maintained by the AREA development team and is subject to updates as the project evolves.*