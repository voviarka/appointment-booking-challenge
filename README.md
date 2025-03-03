## Description

This is an appointment booking challenge project built with the [Nest](https://github.com/nestjs/nest) framework and TypeScript.

## Running the Project

You can run the project in two different modes:

### Local API Server Mode

1. Prepare a Docker container with the database using the resources from the `Take_Home_Challenge_Resources` folder by running the following commands in `/Take_Home_Challenge_Resources/database`:
   ```bash
   docker build -t enpal-coding-challenge-db .  
   docker run -d -p 5432:5432 enpal-coding-challenge-db
   ```

2. Install dependencies in the `appointment-booking-challenge` project:
   ```bash
   npm install
   ```

3. Run the base migration (this initializes migration history for the prefilled database):
   ```bash
   npx prisma migrate resolve --applied 0_init
   ```

4. Apply the remaining migrations:
   ```bash
   npm run prisma:migrate
   ```

5. Start the development server:
   ```bash
   # Watch mode
   npm run start:dev
   ```

6. (Optional) Start the production server:
   ```bash
   # Build the project
   npm run build
   # Run in production mode
   npm run start:prod
   ```

### Docker Container Mode for API Service

1. Prepare a Docker container with the database using the resources from the `Take_Home_Challenge_Resources` folder by running the following commands in `/Take_Home_Challenge_Resources/database`:
   ```bash
   docker build -t enpal-coding-challenge-db .  
   docker run -d -p 5432:5432 enpal-coding-challenge-db
   ```

2. Build and run Docker images for the `appointment-booking-challenge` project:
   ```bash
   docker-compose up --build
   ```

3. Run the base migration (this initializes migration history for the prefilled database):
   ```bash
   docker-compose exec api npx prisma migrate resolve --applied 0_init
   ```

4. Apply the remaining migrations:
   ```bash
   docker-compose exec api npm run prisma:migrate
   ```

## Running Tests

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## API Documentation (Swagger)

Once the project is running, you can access the API documentation at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Deployment

When deploying your NestJS application to production, it's essential to optimize its performance and stability. Refer to the [official deployment documentation](https://docs.nestjs.com/deployment) for best practices.

If you're looking for a cloud-based deployment platform, consider using [Mau](https://mau.nestjs.com), the official service for deploying NestJS applications on AWS. Mau simplifies deployment with just a few commands:

```bash
npm install -g mau
mau deploy
```

With Mau, you can deploy your application in just a few steps, allowing you to focus on development rather than infrastructure management.

## Project Assumptions

1. **Environment Variables:** For simplicity, some environment variables are stored in `.env` files and `docker-compose.yml`. In real-world projects, sensitive configurations should be stored in dedicated services such as GitHub Actions Secrets & Variables or AWS Systems Manager Parameter Store for enhanced security.

2. **Caching:** This project uses an in-memory cache for simplicity. In a production environment, monitoring system load is crucial. Based on the data, you may decide to use a Redis container or a distributed caching solution.

3. **Database Usage for Testing:** A single database container is used for both API requests and end-to-end tests to reduce complexity. In a real-world scenario, it's often better to use a separate test database instance (e.g., a Docker container) while staging and production databases are hosted in cloud services like AWS RDS for PostgreSQL.

## License

This project is licensed under the [MIT License](https://github.com/nestjs/nest/blob/master/LICENSE).

